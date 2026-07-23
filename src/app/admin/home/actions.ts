"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { HOME_CONTENT_ID } from "@/lib/home-content";

export async function saveHomeContent(formData: FormData) {
  await requireAdmin();

  const aboutMarkdown = String(formData.get("aboutMarkdown") ?? "");
  const howToJoinMarkdown = String(formData.get("howToJoinMarkdown") ?? "");

  await prisma.homeContent.upsert({
    where: { id: HOME_CONTENT_ID },
    update: { aboutMarkdown, howToJoinMarkdown },
    create: { id: HOME_CONTENT_ID, aboutMarkdown, howToJoinMarkdown },
  });

  revalidatePath("/");
  revalidatePath("/admin/home");
}
