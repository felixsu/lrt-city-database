"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadCompressedImage, deleteImage, findOversizedFile } from "@/lib/cloudinary";
import { getUploadSettings } from "@/lib/upload-settings";
import { UNIT_TYPES, type UnitType } from "@/lib/user-enums";

export type UserFormState = { error: string | null };

const unitNumberSchema = z
  .string()
  .trim()
  .regex(/^\d{2}-\d{2}$/, "Unit number must be in the format 05-18 (2-digit floor, 2-digit room).");

function isUniqueConstraintError(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

function uniqueConstraintField(err: unknown): string | null {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") return null;
  const target = err.meta?.target;
  return Array.isArray(target) ? String(target[0]) : typeof target === "string" ? target : null;
}

function parseDate(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "");
  return str ? new Date(str) : null;
}

function parseUnitType(value: FormDataEntryValue | null): UnitType | null {
  const str = String(value ?? "");
  return (UNIT_TYPES as readonly string[]).includes(str) ? (str as UnitType) : null;
}

function parsePaymentStatus(value: FormDataEntryValue | null): PaymentStatus {
  return String(value ?? "") === "PAID_OFF" ? PaymentStatus.PAID_OFF : PaymentStatus.IN_PROGRESS;
}

function getFileField(formData: FormData, field: string): File | null {
  const file = formData.get(field);
  return file instanceof File && file.size > 0 ? file : null;
}

async function uploadPhotoIfPresent(formData: FormData, field: string, folder: string) {
  const file = getFileField(formData, field);
  if (!file) return null;

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;
  return uploadCompressedImage(dataUri, folder);
}

export async function createUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const contactNumber = String(formData.get("contactNumber") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "") || null;
  const loanBankId = String(formData.get("loanBankId") ?? "") || null;
  const remarks = String(formData.get("remarks") ?? "").trim() || null;
  const paymentStatus = parsePaymentStatus(formData.get("paymentStatus"));
  const paidOffDate =
    paymentStatus === PaymentStatus.PAID_OFF ? parseDate(formData.get("paidOffDate")) : null;

  if (!name || !contactNumber) return { error: "Name and contact number are required." };

  const user = await prisma.user.create({
    data: {
      name,
      contactNumber,
      buildingId,
      loanBankId,
      paymentStatus,
      paidOffDate,
      remarks,
    },
  });

  revalidatePath("/users");
  revalidatePath("/admin/users");
  redirect(`/admin/users/${user.id}`);
}

export async function updateUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const contactNumber = String(formData.get("contactNumber") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "") || null;
  const loanBankId = String(formData.get("loanBankId") ?? "") || null;
  const remarks = String(formData.get("remarks") ?? "").trim() || null;
  const paymentStatus = parsePaymentStatus(formData.get("paymentStatus"));
  const paidOffDate =
    paymentStatus === PaymentStatus.PAID_OFF ? parseDate(formData.get("paidOffDate")) : null;

  if (!id || !name || !contactNumber) return { error: "Name and contact number are required." };

  await prisma.user.update({
    where: { id },
    data: {
      name,
      contactNumber,
      buildingId,
      loanBankId,
      paymentStatus,
      paidOffDate,
      remarks,
    },
  });

  revalidatePath("/users");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  redirect("/admin/users");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { ownershipDocuments: { include: { photos: true } } },
  });

  if (user) {
    for (const doc of user.ownershipDocuments) {
      if (doc.sppuImagePublicId) {
        await deleteImage(doc.sppuImagePublicId);
      }
      for (const photo of doc.photos) {
        await deleteImage(photo.publicId);
      }
    }
    await prisma.user.delete({ where: { id } });
  }

  revalidatePath("/users");
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function createOwnershipDocument(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const accountNumber = String(formData.get("accountNumber") ?? "").trim() || null;
  if (!userId) return { error: "Missing consumer reference." };

  const unitNumberResult = unitNumberSchema.safeParse(formData.get("unitNumber"));
  if (!unitNumberResult.success) {
    return { error: unitNumberResult.error.issues[0].message };
  }
  const unitNumber = unitNumberResult.data;
  const unitType = parseUnitType(formData.get("unitType"));

  const existingUnit = await prisma.ownershipDocument.findFirst({ where: { unitNumber } });
  if (existingUnit) {
    return { error: `Unit ${unitNumber} is already on record.` };
  }

  if (accountNumber) {
    const existingAccountNumber = await prisma.ownershipDocument.findFirst({
      where: { accountNumber },
    });
    if (existingAccountNumber) {
      return { error: `PPJB number ${accountNumber} is already on record for another unit.` };
    }
  }

  const ppjbDate = parseDate(formData.get("ppjbDate"));
  const sppuNumber = String(formData.get("sppuNumber") ?? "").trim() || null;
  const sppuDate = parseDate(formData.get("sppuDate"));

  const settings = await getUploadSettings();
  const maxBytes = settings.ppjbMaxUploadMb * 1024 * 1024;
  const providedFiles = [getFileField(formData, "photo"), getFileField(formData, "sppuImage")].filter(
    (file): file is File => file !== null,
  );
  const oversizedError = findOversizedFile(providedFiles, maxBytes);
  if (oversizedError) return { error: oversizedError };

  let photo: Awaited<ReturnType<typeof uploadPhotoIfPresent>> = null;
  let sppuImage: Awaited<ReturnType<typeof uploadPhotoIfPresent>> = null;
  let warning: string | null = null;

  try {
    photo = await uploadPhotoIfPresent(formData, "photo", "lrt-city-tebet/ownership-documents");
  } catch (err) {
    console.error("Failed to upload unit ownership photo:", err);
    warning = "Unit added, but the photo failed to upload — add it separately below.";
  }

  try {
    sppuImage = await uploadPhotoIfPresent(formData, "sppuImage", "lrt-city-tebet/sppu");
  } catch (err) {
    console.error("Failed to upload SPPU image:", err);
    warning = "Unit added, but the SPPU image failed to upload — try replacing it below.";
  }

  try {
    await prisma.ownershipDocument.create({
      data: {
        userId,
        accountNumber,
        unitNumber,
        unitType,
        ppjbDate,
        sppuNumber,
        sppuDate,
        sppuImageUrl: sppuImage?.secure_url,
        sppuImagePublicId: sppuImage?.public_id,
        photos: photo
          ? {
              create: {
                url: photo.secure_url,
                publicId: photo.public_id,
                bytes: photo.bytes,
                width: photo.width,
                height: photo.height,
              },
            }
          : undefined,
      },
    });
  } catch (err) {
    if (uniqueConstraintField(err) === "accountNumber") {
      return { error: `PPJB number ${accountNumber} is already on record for another unit.` };
    }
    if (isUniqueConstraintError(err)) {
      return { error: `Unit ${unitNumber} is already on record.` };
    }
    throw err;
  }

  revalidatePath("/users");
  revalidatePath(`/admin/users/${userId}`);
  return { error: warning };
}

export async function updateOwnershipDocument(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const accountNumber = String(formData.get("accountNumber") ?? "").trim() || null;
  if (!id) return { error: "Missing unit reference." };

  const unitNumberResult = unitNumberSchema.safeParse(formData.get("unitNumber"));
  if (!unitNumberResult.success) {
    return { error: unitNumberResult.error.issues[0].message };
  }
  const unitNumber = unitNumberResult.data;
  const unitType = parseUnitType(formData.get("unitType"));

  const existingUnit = await prisma.ownershipDocument.findFirst({
    where: { unitNumber, NOT: { id } },
  });
  if (existingUnit) {
    return { error: `Unit ${unitNumber} is already on record.` };
  }

  if (accountNumber) {
    const existingAccountNumber = await prisma.ownershipDocument.findFirst({
      where: { accountNumber, NOT: { id } },
    });
    if (existingAccountNumber) {
      return { error: `PPJB number ${accountNumber} is already on record for another unit.` };
    }
  }

  const ppjbDate = parseDate(formData.get("ppjbDate"));
  const sppuNumber = String(formData.get("sppuNumber") ?? "").trim() || null;
  const sppuDate = parseDate(formData.get("sppuDate"));

  const settings = await getUploadSettings();
  const sppuImageFile = getFileField(formData, "sppuImage");
  if (sppuImageFile) {
    const oversizedError = findOversizedFile([sppuImageFile], settings.ppjbMaxUploadMb * 1024 * 1024);
    if (oversizedError) return { error: oversizedError };
  }

  const existing = await prisma.ownershipDocument.findUnique({ where: { id } });
  if (!existing) return { error: "Unit not found." };

  let sppuImage: Awaited<ReturnType<typeof uploadPhotoIfPresent>> = null;
  let warning: string | null = null;
  try {
    sppuImage = await uploadPhotoIfPresent(formData, "sppuImage", "lrt-city-tebet/sppu");
  } catch (err) {
    console.error("Failed to upload SPPU image:", err);
    warning = "Saved, but the new SPPU image failed to upload — try again.";
  }

  if (sppuImage && existing.sppuImagePublicId) {
    await deleteImage(existing.sppuImagePublicId);
  }

  try {
    await prisma.ownershipDocument.update({
      where: { id },
      data: {
        accountNumber,
        unitNumber,
        unitType,
        ppjbDate,
        sppuNumber,
        sppuDate,
        ...(sppuImage
          ? { sppuImageUrl: sppuImage.secure_url, sppuImagePublicId: sppuImage.public_id }
          : {}),
      },
    });
  } catch (err) {
    if (uniqueConstraintField(err) === "accountNumber") {
      return { error: `PPJB number ${accountNumber} is already on record for another unit.` };
    }
    if (isUniqueConstraintError(err)) {
      return { error: `Unit ${unitNumber} is already on record.` };
    }
    throw err;
  }

  revalidatePath("/users");
  if (userId) revalidatePath(`/admin/users/${userId}`);
  return { error: warning };
}

export async function deleteOwnershipDocument(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!id) return;

  const doc = await prisma.ownershipDocument.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (doc) {
    if (doc.sppuImagePublicId) {
      await deleteImage(doc.sppuImagePublicId);
    }
    for (const photo of doc.photos) {
      await deleteImage(photo.publicId);
    }
    await prisma.ownershipDocument.delete({ where: { id } });
  }

  revalidatePath("/users");
  if (userId) revalidatePath(`/admin/users/${userId}`);
}

export async function addOwnershipDocumentPhoto(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();

  const ownershipDocumentId = String(formData.get("ownershipDocumentId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!ownershipDocumentId) return { error: "Missing unit reference." };

  const photoFile = getFileField(formData, "photo");
  if (!photoFile) return { error: "Choose a photo to upload." };

  const settings = await getUploadSettings();
  const oversizedError = findOversizedFile([photoFile], settings.ppjbMaxUploadMb * 1024 * 1024);
  if (oversizedError) return { error: oversizedError };

  let photo: Awaited<ReturnType<typeof uploadPhotoIfPresent>>;
  try {
    photo = await uploadPhotoIfPresent(formData, "photo", "lrt-city-tebet/ownership-documents");
  } catch (err) {
    console.error("Failed to upload unit ownership photo:", err);
    return { error: "Photo upload failed. Please try again with a smaller image." };
  }
  if (!photo) return { error: "Choose a photo to upload." };

  await prisma.ownershipDocumentPhoto.create({
    data: {
      ownershipDocumentId,
      url: photo.secure_url,
      publicId: photo.public_id,
      bytes: photo.bytes,
      width: photo.width,
      height: photo.height,
    },
  });

  revalidatePath("/users");
  if (userId) revalidatePath(`/admin/users/${userId}`);
  return { error: null };
}

export async function deleteOwnershipDocumentPhoto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!id) return;

  const photo = await prisma.ownershipDocumentPhoto.findUnique({ where: { id } });
  if (photo) {
    await deleteImage(photo.publicId);
    await prisma.ownershipDocumentPhoto.delete({ where: { id } });
  }

  revalidatePath("/users");
  if (userId) revalidatePath(`/admin/users/${userId}`);
}
