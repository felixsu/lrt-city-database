"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadCompressedImage, deleteImage } from "@/lib/cloudinary";

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

async function uploadPhotoIfPresent(formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return null;

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;
  return uploadCompressedImage(dataUri, "lrt-city-tebet/ppjb");
}

export async function createUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const contactNumber = String(formData.get("contactNumber") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "") || null;
  const remarks = String(formData.get("remarks") ?? "").trim() || null;
  const buyDate = parseDate(formData.get("buyDate"));
  const joinDate = parseDate(formData.get("joinDate"));

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
      data: { name, unitNumber, contactNumber, buildingId, remarks, buyDate, joinDate },
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
  const remarks = String(formData.get("remarks") ?? "").trim() || null;
  const buyDate = parseDate(formData.get("buyDate"));
  const joinDate = parseDate(formData.get("joinDate"));

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
      data: { name, unitNumber, contactNumber, buildingId, remarks, buyDate, joinDate },
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
  return { error: null };
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { ppjbs: { include: { photos: true } } },
  });

  if (user) {
    for (const ppjb of user.ppjbs) {
      for (const photo of ppjb.photos) {
        await deleteImage(photo.publicId);
      }
    }
    await prisma.user.delete({ where: { id } });
  }

  revalidatePath("/users");
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function addPpjb(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  if (!userId || !accountNumber) return;

  const photo = await uploadPhotoIfPresent(formData);

  await prisma.ppjb.create({
    data: {
      userId,
      accountNumber,
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
}

export async function deletePpjb(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!id) return;

  const ppjb = await prisma.ppjb.findUnique({ where: { id }, include: { photos: true } });
  if (ppjb) {
    for (const photo of ppjb.photos) {
      await deleteImage(photo.publicId);
    }
    await prisma.ppjb.delete({ where: { id } });
  }

  revalidatePath("/users");
  if (userId) revalidatePath(`/admin/users/${userId}`);
}

export async function addPpjbPhoto(formData: FormData) {
  await requireAdmin();

  const ppjbId = String(formData.get("ppjbId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!ppjbId) return;

  const photo = await uploadPhotoIfPresent(formData);
  if (!photo) return;

  await prisma.ppjbPhoto.create({
    data: {
      ppjbId,
      url: photo.secure_url,
      publicId: photo.public_id,
      bytes: photo.bytes,
      width: photo.width,
      height: photo.height,
    },
  });

  revalidatePath("/users");
  if (userId) revalidatePath(`/admin/users/${userId}`);
}

export async function deletePpjbPhoto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!id) return;

  const photo = await prisma.ppjbPhoto.findUnique({ where: { id } });
  if (photo) {
    await deleteImage(photo.publicId);
    await prisma.ppjbPhoto.delete({ where: { id } });
  }

  revalidatePath("/users");
  if (userId) revalidatePath(`/admin/users/${userId}`);
}
