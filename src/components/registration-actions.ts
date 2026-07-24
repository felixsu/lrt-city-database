"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { unitNumberSchema } from "@/lib/ownership-validation";
import { verifyHcaptchaToken } from "@/lib/hcaptcha";

export type LeadFormState = { error: string | null; success?: boolean };

export async function createLead(
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  // Honeypot: bots tend to fill every field, including ones hidden from real users.
  // Silently report success without writing anything so bots don't learn to avoid it.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { error: null, success: true };
  }

  const captchaToken = String(formData.get("h-captcha-response") ?? "");
  const captchaOk = await verifyHcaptchaToken(captchaToken);
  if (!captchaOk) {
    return { error: "Captcha verification failed. Please try again." };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const contactNumber = String(formData.get("contactNumber") ?? "").trim();
  const buildingId = String(formData.get("buildingId") ?? "").trim();
  const ppjbNumber = String(formData.get("ppjbNumber") ?? "").trim();
  const sppuNumber = String(formData.get("sppuNumber") ?? "").trim();

  if (!fullName || !contactNumber || !buildingId || !ppjbNumber || !sppuNumber) {
    return { error: "All fields are required." };
  }

  const unitNumberResult = unitNumberSchema.safeParse(formData.get("unitNumber"));
  if (!unitNumberResult.success) {
    return { error: unitNumberResult.error.issues[0].message };
  }

  await prisma.lead.create({
    data: {
      fullName,
      contactNumber,
      unitNumber: unitNumberResult.data,
      ppjbNumber,
      sppuNumber,
      buildingId,
    },
  });

  revalidatePath("/admin/leads");
  return { error: null, success: true };
}
