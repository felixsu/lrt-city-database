"use server";

import { prisma } from "@/lib/prisma";
import { normalizeEmail, normalizePhone } from "@/lib/csv-parser";

export type ConsumerLookupRecord = {
  id: string;
  project: string;
  unit: string;
  contractValue: string;
  ppjb: string;
  sppu: string;
  paymentType: string;
  bank: string;
  loanTenorMonths: string;
  loanMonthsPaid: string;
  paymentStatus: string;
  demand: string;
  materialLossPaid: string;
  materialDetails: string;
  remainingArrears: string;
  otherLosses: string;
  lossBasisCalc: string;
  pinjamPakai: string;
  maxWaitDuration: string;
  compensation: string;
  surveyTimestamp: string;
};

export type ConsumerLookupState = {
  error: string | null;
  name?: string;
  email?: string;
  phone?: string;
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
      email: true,
      contactNumber: true,
      building: { select: { name: true } },
      ownershipDocuments: {
        select: {
          id: true,
          unitNumber: true,
          contractValue: true,
          tuntutan: true,
          loanPaymentStatus: true,
          accountNumber: true,
          sppuNumber: true,
          paymentType: true,
          loanBankName: true,
          loanTenorMonths: true,
          loanMonthsPaid: true,
          materialLossPaid: true,
          materialDetails: true,
          remainingArrears: true,
          otherLosses: true,
          lossBasisCalc: true,
          pinjamPakai: true,
          maxWaitDuration: true,
          compensation: true,
          surveyTimestamp: true,
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
    email: matches[0].email ?? email,
    phone: matches[0].contactNumber,
    records: matches.flatMap((consumer) =>
      consumer.ownershipDocuments.map((document) => ({
        id: document.id,
        project: consumer.building?.name ?? "Unassigned",
        unit: document.unitNumber ?? "—",
        contractValue: document.contractValue ?? "Not recorded",
        ppjb: document.accountNumber ?? "Not recorded",
        sppu: document.sppuNumber ?? "Not recorded",
        paymentType: document.paymentType ?? "Not recorded",
        bank: document.loanBankName ?? "Not recorded",
        loanTenorMonths: document.loanTenorMonths?.toString() ?? "Not recorded",
        loanMonthsPaid: document.loanMonthsPaid?.toString() ?? "Not recorded",
        demand: document.tuntutan ?? "Not specified",
        paymentStatus: document.loanPaymentStatus ?? "Not recorded",
        materialLossPaid: document.materialLossPaid ?? "Not recorded",
        materialDetails: document.materialDetails ?? "Not recorded",
        remainingArrears: document.remainingArrears ?? "Not recorded",
        otherLosses: document.otherLosses ?? "Not recorded",
        lossBasisCalc: document.lossBasisCalc ?? "Not recorded",
        pinjamPakai: document.pinjamPakai ?? "Not recorded",
        maxWaitDuration: document.maxWaitDuration ?? "Not recorded",
        compensation: document.compensation ?? "Not recorded",
        surveyTimestamp: document.surveyTimestamp?.toLocaleString("id-ID") ?? "Not recorded",
      })),
    ),
  };
}
