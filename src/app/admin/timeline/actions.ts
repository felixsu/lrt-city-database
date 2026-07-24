"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadCompressedImage, uploadVideo, deleteImage, findOversizedFile } from "@/lib/cloudinary";
import { getUploadSettings } from "@/lib/upload-settings";

export type TimelineMediaFormState = { error: string | null };

function collectMediaFiles(formData: FormData): File[] {
  return formData
    .getAll("media")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

async function uploadMediaFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  if (file.type.startsWith("video/")) {
    const result = await uploadVideo(dataUri, "lrt-city-tebet/timeline");
    return { type: "VIDEO" as const, result };
  }
  const result = await uploadCompressedImage(dataUri, "lrt-city-tebet/timeline");
  return { type: "PHOTO" as const, result };
}

async function createMediaRows(timelineEventId: string, files: File[]) {
  for (const file of files) {
    try {
      const { type, result } = await uploadMediaFile(file);
      await prisma.timelineEventMedia.create({
        data: {
          timelineEventId,
          type,
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        },
      });
    } catch (err) {
      console.error("Failed to upload timeline media:", err);
    }
  }
}

export async function createTimelineEvent(
  _prevState: TimelineMediaFormState,
  formData: FormData,
): Promise<TimelineMediaFormState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const eventDateRaw = String(formData.get("eventDate") ?? "");
  const order = Number(formData.get("order") ?? 0);

  if (!title) return { error: "Title is required." };

  const files = collectMediaFiles(formData);
  const settings = await getUploadSettings();
  const oversizedError = findOversizedFile(files, settings.timelineMaxUploadMb * 1024 * 1024);
  if (oversizedError) return { error: oversizedError };

  const event = await prisma.timelineEvent.create({
    data: {
      title,
      description,
      order: Number.isFinite(order) ? order : 0,
      eventDate: eventDateRaw ? new Date(eventDateRaw) : null,
    },
  });

  await createMediaRows(event.id, files);

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

  await prisma.timelineEvent.update({
    where: { id },
    data: {
      title,
      description,
      order: Number.isFinite(order) ? order : 0,
      eventDate: eventDateRaw ? new Date(eventDateRaw) : null,
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

  const existing = await prisma.timelineEvent.findUnique({ where: { id }, include: { media: true } });
  if (existing) {
    for (const item of existing.media) {
      await deleteImage(item.publicId, item.type === "VIDEO" ? "video" : "image");
    }
  }

  await prisma.timelineEvent.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/timeline");
  redirect("/admin/timeline");
}

export async function addTimelineEventMedia(
  _prevState: TimelineMediaFormState,
  formData: FormData,
): Promise<TimelineMediaFormState> {
  await requireAdmin();

  const timelineEventId = String(formData.get("timelineEventId") ?? "");
  if (!timelineEventId) return { error: "Missing timeline event reference." };

  const files = collectMediaFiles(formData);
  if (files.length === 0) return { error: "Choose at least one photo or video to upload." };

  const settings = await getUploadSettings();
  const oversizedError = findOversizedFile(files, settings.timelineMaxUploadMb * 1024 * 1024);
  if (oversizedError) return { error: oversizedError };

  await createMediaRows(timelineEventId, files);

  revalidatePath("/");
  revalidatePath(`/admin/timeline/${timelineEventId}`);
  return { error: null };
}

export async function deleteTimelineEventMedia(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const timelineEventId = String(formData.get("timelineEventId") ?? "");
  if (!id) return;

  const media = await prisma.timelineEventMedia.findUnique({ where: { id } });
  if (media) {
    await deleteImage(media.publicId, media.type === "VIDEO" ? "video" : "image");
    await prisma.timelineEventMedia.delete({ where: { id } });
  }

  revalidatePath("/");
  if (timelineEventId) revalidatePath(`/admin/timeline/${timelineEventId}`);
}
