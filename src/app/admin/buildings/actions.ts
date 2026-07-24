"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

function parseTotalUnits(formData: FormData) {
  const raw = String(formData.get("totalUnits") ?? "").trim();
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function addBuilding(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const totalUnits = parseTotalUnits(formData);

  await prisma.building.create({ data: { name, totalUnits } });
  revalidatePath("/admin/buildings");
  revalidatePath("/admin/users");
  revalidatePath("/users");
}

export async function updateBuilding(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;
  const totalUnits = parseTotalUnits(formData);

  await prisma.building.update({ where: { id }, data: { name, totalUnits: totalUnits ?? null } });
  revalidatePath("/admin/buildings");
  revalidatePath("/admin/users");
  revalidatePath("/users");
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
