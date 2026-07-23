"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function addBuilding(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.building.create({ data: { name } });
  revalidatePath("/admin/buildings");
  revalidatePath("/admin/users");
}

export async function deleteBuilding(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.building.delete({ where: { id } });
  revalidatePath("/admin/buildings");
  revalidatePath("/admin/users");
  revalidatePath("/users");
}
