"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { HOME_CONTENT_ID } from "@/lib/home-content";

export async function saveHomeContent(formData: FormData) {
  await requireAdmin();

  const aboutTitle = String(formData.get("aboutTitle") ?? "").trim();
  const aboutMarkdown = String(formData.get("aboutMarkdown") ?? "");
  const howToJoinTitle = String(formData.get("howToJoinTitle") ?? "").trim();
  const howToJoinMarkdown = String(formData.get("howToJoinMarkdown") ?? "");

  const data = { aboutTitle, aboutMarkdown, howToJoinTitle, howToJoinMarkdown };

  await prisma.homeContent.upsert({
    where: { id: HOME_CONTENT_ID },
    update: data,
    create: { id: HOME_CONTENT_ID, ...data },
  });

  revalidatePath("/");
  revalidatePath("/admin/home");
}
