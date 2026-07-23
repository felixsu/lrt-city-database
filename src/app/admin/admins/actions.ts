"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function promoteAdmin(formData: FormData) {
  const session = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, promotedBy: session.user?.email ?? null },
  });

  revalidatePath("/admin/admins");
}

export async function removeAdmin(formData: FormData) {
  const session = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return;

  if (target.email === session.user?.email?.toLowerCase()) {
    // Prevent self-lockout.
    return;
  }

  const totalAdmins = await prisma.adminUser.count();
  if (totalAdmins <= 1) return;

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/admins");
}
