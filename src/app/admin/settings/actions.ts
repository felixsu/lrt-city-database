"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { UPLOAD_SETTINGS_ID } from "@/lib/upload-settings";

function parsePositiveInt(value: FormDataEntryValue | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

export async function saveUploadSettings(formData: FormData) {
  await requireAdmin();

  const timelineMaxUploadMb = parsePositiveInt(formData.get("timelineMaxUploadMb"), 10);
  const ppjbMaxUploadMb = parsePositiveInt(formData.get("ppjbMaxUploadMb"), 10);

  await prisma.uploadSettings.upsert({
    where: { id: UPLOAD_SETTINGS_ID },
    update: { timelineMaxUploadMb, ppjbMaxUploadMb },
    create: { id: UPLOAD_SETTINGS_ID, timelineMaxUploadMb, ppjbMaxUploadMb },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/timeline");
  revalidatePath("/admin/timeline/new");
  revalidatePath("/admin/users");
}
