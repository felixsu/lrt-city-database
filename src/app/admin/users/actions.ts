"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadCompressedImage, deleteImage } from "@/lib/cloudinary";

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

export async function createUser(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const contactNumber = String(formData.get("contactNumber") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "") || null;
  const remarks = String(formData.get("remarks") ?? "").trim() || null;
  const buyDate = parseDate(formData.get("buyDate"));
  const joinDate = parseDate(formData.get("joinDate"));

  if (!name || !contactNumber) return;

  const user = await prisma.user.create({
    data: { name, contactNumber, buildingId, remarks, buyDate, joinDate },
  });

  revalidatePath("/users");
  revalidatePath("/admin/users");
  redirect(`/admin/users/${user.id}`);
}

export async function updateUser(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const contactNumber = String(formData.get("contactNumber") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "") || null;
  const remarks = String(formData.get("remarks") ?? "").trim() || null;
  const buyDate = parseDate(formData.get("buyDate"));
  const joinDate = parseDate(formData.get("joinDate"));

  if (!id || !name || !contactNumber) return;

  await prisma.user.update({
    where: { id },
    data: { name, contactNumber, buildingId, remarks, buyDate, joinDate },
  });

  revalidatePath("/users");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
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
