"use server";

import { prisma } from "@/lib/prisma";
import { normalizeEmail, normalizePhone } from "@/lib/csv-parser";
import { maskDocumentNumber } from "@/lib/mask";

export type ConsumerLookupRecord = {
  project: string;
  unit: string;
  demand: string;
  paymentStatus: string;
  ppjb: string;
  sppu: string;
};

export type ConsumerLookupState = {
  error: string | null;
  name?: string;
  records?: ConsumerLookupRecord[];
};

export async function findConsumerRecord(
  _previousState: ConsumerLookupState,
  formData: FormData,
): Promise<ConsumerLookupState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const phone = normalizePhone(String(formData.get("phone") ?? ""));

  if (!email || !phone) {
    return { error: "Enter the email address and WhatsApp number used in the form." };
  }

  const consumers = await prisma.user.findMany({
    where: { email },
    select: {
      name: true,
      contactNumber: true,
      building: { select: { name: true } },
      ownershipDocuments: {
        select: {
          unitNumber: true,
          tuntutan: true,
          loanPaymentStatus: true,
          accountNumber: true,
          sppuNumber: true,
        },
      },
    },
  });

  const matches = consumers.filter((consumer) => normalizePhone(consumer.contactNumber) === phone);
  if (matches.length === 0) {
    return { error: "We could not find a matching record. Check both details and try again." };
  }

  return {
    error: null,
    name: matches[0].name,
    records: matches.flatMap((consumer) =>
      consumer.ownershipDocuments.map((document) => ({
        project: consumer.building?.name ?? "Unassigned",
        unit: document.unitNumber ?? "—",
        demand: document.tuntutan ?? "Not specified",
        paymentStatus: document.loanPaymentStatus ?? "Not recorded",
        ppjb: document.accountNumber ? maskDocumentNumber(document.accountNumber) : "Not recorded",
        sppu: document.sppuNumber ? maskDocumentNumber(document.sppuNumber) : "Not recorded",
      })),
    ),
  };
}
