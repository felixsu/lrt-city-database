"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadCompressedImage, deleteImage } from "@/lib/cloudinary";
import { UNIT_TYPES, type UnitType } from "@/lib/user-enums";

export type UserFormState = { error: string | null };

const unitNumberSchema = z
  .string()
  .trim()
  .regex(/^\d{2}-\d{2}$/, "Unit number must be in the format 05-18 (2-digit floor, 2-digit room).");

function isUniqueConstraintError(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
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

async function uploadPhotoIfPresent(formData: FormData, field: string, folder: string) {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return null;

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
  const unitType = parseUnitType(formData.get("unitType"));
  const paymentStatus = parsePaymentStatus(formData.get("paymentStatus"));
  const paidOffDate =
    paymentStatus === PaymentStatus.PAID_OFF ? parseDate(formData.get("paidOffDate")) : null;

  if (!name || !contactNumber) return { error: "Name and contact number are required." };

  const unitNumberResult = unitNumberSchema.safeParse(formData.get("unitNumber"));
  if (!unitNumberResult.success) {
    return { error: unitNumberResult.error.issues[0].message };
  }
  const unitNumber = unitNumberResult.data;

  const existing = await prisma.user.findFirst({ where: { unitNumber } });
  if (existing) {
    return { error: `Unit ${unitNumber} is already assigned to another resident.` };
  }

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        unitNumber,
        unitType,
        contactNumber,
        buildingId,
        loanBankId,
        paymentStatus,
        paidOffDate,
        remarks,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { error: `Unit ${unitNumber} is already assigned to another resident.` };
    }
    throw err;
  }

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
  const unitType = parseUnitType(formData.get("unitType"));
  const paymentStatus = parsePaymentStatus(formData.get("paymentStatus"));
  const paidOffDate =
    paymentStatus === PaymentStatus.PAID_OFF ? parseDate(formData.get("paidOffDate")) : null;

  if (!id || !name || !contactNumber) return { error: "Name and contact number are required." };

  const unitNumberResult = unitNumberSchema.safeParse(formData.get("unitNumber"));
  if (!unitNumberResult.success) {
    return { error: unitNumberResult.error.issues[0].message };
  }
  const unitNumber = unitNumberResult.data;

  const existing = await prisma.user.findFirst({ where: { unitNumber, NOT: { id } } });
  if (existing) {
    return { error: `Unit ${unitNumber} is already assigned to another resident.` };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name,
        unitNumber,
        unitType,
        contactNumber,
        buildingId,
        loanBankId,
        paymentStatus,
        paidOffDate,
        remarks,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { error: `Unit ${unitNumber} is already assigned to another resident.` };
    }
    throw err;
  }

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
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  if (!userId || !accountNumber) return { error: "PPJB number is required." };

  const ppjbDate = parseDate(formData.get("ppjbDate"));
  const sppuNumber = String(formData.get("sppuNumber") ?? "").trim() || null;
  const sppuDate = parseDate(formData.get("sppuDate"));

  let photo: Awaited<ReturnType<typeof uploadPhotoIfPresent>> = null;
  let sppuImage: Awaited<ReturnType<typeof uploadPhotoIfPresent>> = null;
  let warning: string | null = null;

  try {
    photo = await uploadPhotoIfPresent(formData, "photo", "lrt-city-tebet/ownership-documents");
  } catch (err) {
    console.error("Failed to upload ownership document photo:", err);
    warning = "Document added, but the photo failed to upload — add it separately below.";
  }

  try {
    sppuImage = await uploadPhotoIfPresent(formData, "sppuImage", "lrt-city-tebet/sppu");
  } catch (err) {
    console.error("Failed to upload SPPU image:", err);
    warning = "Document added, but the SPPU image failed to upload — try replacing it below.";
  }

  await prisma.ownershipDocument.create({
    data: {
      userId,
      accountNumber,
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
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  if (!id || !accountNumber) return { error: "PPJB number is required." };

  const ppjbDate = parseDate(formData.get("ppjbDate"));
  const sppuNumber = String(formData.get("sppuNumber") ?? "").trim() || null;
  const sppuDate = parseDate(formData.get("sppuDate"));

  const existing = await prisma.ownershipDocument.findUnique({ where: { id } });
  if (!existing) return { error: "Ownership document not found." };

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

  await prisma.ownershipDocument.update({
    where: { id },
    data: {
      accountNumber,
      ppjbDate,
      sppuNumber,
      sppuDate,
      ...(sppuImage
        ? { sppuImageUrl: sppuImage.secure_url, sppuImagePublicId: sppuImage.public_id }
        : {}),
    },
  });

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
  if (!ownershipDocumentId) return { error: "Missing ownership document reference." };

  let photo: Awaited<ReturnType<typeof uploadPhotoIfPresent>>;
  try {
    photo = await uploadPhotoIfPresent(formData, "photo", "lrt-city-tebet/ownership-documents");
  } catch (err) {
    console.error("Failed to upload ownership document photo:", err);
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
