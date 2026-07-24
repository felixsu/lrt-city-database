"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadCompressedImage, deleteImage, findOversizedFile, MAX_UPLOAD_BYTES } from "@/lib/cloudinary";

function getFileField(formData: FormData, field: string): File | null {
  const file = formData.get(field);
  return file instanceof File && file.size > 0 ? file : null;
}

async function uploadImageIfPresent(formData: FormData, field: string) {
  const file = getFileField(formData, field);
  if (!file) return null;

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;
  return uploadCompressedImage(dataUri, "lrt-city-tebet/resources");
}

export async function addResource(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !description) return;

  const image = getFileField(formData, "image");
  if (image) {
    const oversizedError = findOversizedFile([image], MAX_UPLOAD_BYTES);
    if (oversizedError) return;
  }

  const uploaded = await uploadImageIfPresent(formData, "image");

  await prisma.resource.create({
    data: {
      title,
      description,
      imageUrl: uploaded?.secure_url,
      imagePublicId: uploaded?.public_id,
    },
  });

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}

export async function updateResource(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  const image = getFileField(formData, "image");
  if (image) {
    const oversizedError = findOversizedFile([image], MAX_UPLOAD_BYTES);
    if (oversizedError) return;
  }

  const uploaded = await uploadImageIfPresent(formData, "image");

  if (uploaded) {
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (existing?.imagePublicId) {
      await deleteImage(existing.imagePublicId);
    }
  }

  await prisma.resource.update({
    where: { id },
    data: {
      title,
      description,
      order: Number.isFinite(order) ? order : 0,
      ...(uploaded ? { imageUrl: uploaded.secure_url, imagePublicId: uploaded.public_id } : {}),
    },
  });

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}

export async function reorderResources(orderedIds: string[]) {
  await requireAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.resource.update({ where: { id }, data: { order: index } }),
    ),
  );

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}

export async function deleteResource(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (resource?.imagePublicId) {
    await deleteImage(resource.imagePublicId);
  }

  await prisma.resource.delete({ where: { id } });

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
}
