"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { isUniqueConstraintError, uniqueConstraintField } from "@/lib/ownership-validation";

export type LeadConvertState = { error: string | null };

export async function convertLead(
  _prevState: LeadConvertState,
  formData: FormData,
): Promise<LeadConvertState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing lead reference." };

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return { error: "Lead not found." };
  if (lead.status === "CONVERTED") return { error: "Lead is already converted." };

  let userId: string;
  try {
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: lead.fullName,
          contactNumber: lead.contactNumber,
          buildingId: lead.buildingId,
        },
      });

      await tx.ownershipDocument.create({
        data: {
          userId: newUser.id,
          unitNumber: lead.unitNumber,
          accountNumber: lead.ppjbNumber,
          sppuNumber: lead.sppuNumber,
        },
      });

      await tx.lead.update({
        where: { id },
        data: { status: "CONVERTED", convertedUserId: newUser.id, convertedAt: new Date() },
      });

      return newUser;
    });
    userId = user.id;
  } catch (err) {
    if (uniqueConstraintField(err) === "accountNumber") {
      return { error: `PPJB number ${lead.ppjbNumber} is already on record for another unit.` };
    }
    if (isUniqueConstraintError(err)) {
      return { error: `Unit ${lead.unitNumber} is already on record.` };
    }
    throw err;
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin/users");
  revalidatePath("/users");
  redirect(`/admin/users/${userId}`);
}

export async function deleteLead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
}
