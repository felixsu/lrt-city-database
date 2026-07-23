"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadCompressedImage, deleteImage } from "@/lib/cloudinary";

async function uploadPictureIfPresent(formData: FormData) {
  const file = formData.get("picture");
  if (!(file instanceof File) || file.size === 0) return null;

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;
  return uploadCompressedImage(dataUri, "lrt-city-tebet/timeline");
}

export async function createTimelineEvent(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const eventDateRaw = String(formData.get("eventDate") ?? "");
  const order = Number(formData.get("order") ?? 0);

  if (!title) return;

  const picture = await uploadPictureIfPresent(formData);

  await prisma.timelineEvent.create({
    data: {
      title,
      description,
      order: Number.isFinite(order) ? order : 0,
      eventDate: eventDateRaw ? new Date(eventDateRaw) : null,
      pictureUrl: picture?.secure_url,
      picturePublicId: picture?.public_id,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/timeline");
  redirect("/admin/timeline");
}

export async function updateTimelineEvent(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const eventDateRaw = String(formData.get("eventDate") ?? "");
  const order = Number(formData.get("order") ?? 0);
  if (!id || !title) return;

  const existing = await prisma.timelineEvent.findUniqueOrThrow({ where: { id } });
  const picture = await uploadPictureIfPresent(formData);

  if (picture && existing.picturePublicId) {
    await deleteImage(existing.picturePublicId);
  }

  await prisma.timelineEvent.update({
    where: { id },
    data: {
      title,
      description,
      order: Number.isFinite(order) ? order : 0,
      eventDate: eventDateRaw ? new Date(eventDateRaw) : null,
      ...(picture
        ? { pictureUrl: picture.secure_url, picturePublicId: picture.public_id }
        : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/timeline");
  redirect("/admin/timeline");
}

export async function reorderTimelineEvents(orderedIds: string[]) {
  await requireAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.timelineEvent.update({ where: { id }, data: { order: index } }),
    ),
  );

  revalidatePath("/");
  revalidatePath("/admin/timeline");
}

export async function deleteTimelineEvent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.timelineEvent.findUnique({ where: { id } });
  if (existing?.picturePublicId) {
    await deleteImage(existing.picturePublicId);
  }

  await prisma.timelineEvent.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/timeline");
  redirect("/admin/timeline");
}
