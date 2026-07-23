"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { fetchLinkPreview } from "@/lib/link-preview";

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export async function addMediaLink(formData: FormData) {
  await requireAdmin();

  const url = String(formData.get("url") ?? "").trim();
  if (!url || !isHttpUrl(url)) return;

  const preview = await fetchLinkPreview(url);

  await prisma.mediaLink.create({
    data: {
      url,
      title: preview.title,
      description: preview.description,
      imageUrl: preview.imageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/media");
}

export async function updateMediaLink(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const title = String(formData.get("title") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const order = Number(formData.get("order") ?? 0);

  await prisma.mediaLink.update({
    where: { id },
    data: { title, description, imageUrl, order: Number.isFinite(order) ? order : 0 },
  });

  revalidatePath("/");
  revalidatePath("/admin/media");
}

export async function refreshMediaLinkPreview(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const link = await prisma.mediaLink.findUnique({ where: { id } });
  if (!link) return;

  const preview = await fetchLinkPreview(link.url);

  await prisma.mediaLink.update({
    where: { id },
    data: {
      title: preview.title ?? link.title,
      description: preview.description ?? link.description,
      imageUrl: preview.imageUrl ?? link.imageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/media");
}

export async function reorderMediaLinks(orderedIds: string[]) {
  await requireAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.mediaLink.update({ where: { id }, data: { order: index } }),
    ),
  );

  revalidatePath("/");
  revalidatePath("/admin/media");
}

export async function deleteMediaLink(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.mediaLink.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/media");
}
