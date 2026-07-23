"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function addLoanBank(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.loanBank.create({ data: { name } });
  revalidatePath("/admin/loan-banks");
  revalidatePath("/admin/users");
}

export async function updateLoanBank(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  await prisma.loanBank.update({ where: { id }, data: { name } });
  revalidatePath("/admin/loan-banks");
  revalidatePath("/admin/users");
}

export async function deleteLoanBank(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.loanBank.delete({ where: { id } });
  revalidatePath("/admin/loan-banks");
  revalidatePath("/admin/users");
}
