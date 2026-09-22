"use server";

import { revalidatePath } from "next/cache";
import { deleteImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { parseCSVConsumerRows, normalizeEmail, normalizePhone, normalizeUnitNumber, type CSVConsumerRecord } from "@/lib/csv-parser";

export type AnalysisRowStatus = "MATCHED_EXISTING" | "NEW" | "DUPLICATE_IN_CSV";
export interface AnalyzedCSVRow { index: number; status: AnalysisRowStatus; statusReason: string; matchedUserId?: string; matchedUserName?: string; record: CSVConsumerRecord }
export interface CSVAnalysisResult { totalRows: number; matchedCount: number; newCount: number; duplicateInCsvCount: number; rows: AnalyzedCSVRow[] }

function key(r: CSVConsumerRecord) { return [normalizeEmail(r.email), normalizePhone(r.phone), normalizeUnitNumber(r.unitNumber)].join("|"); }
function complete(r: CSVConsumerRecord) { return Boolean(normalizeEmail(r.email) && normalizePhone(r.phone) && normalizeUnitNumber(r.unitNumber)); }
function buildingName(r: CSVConsumerRecord) { return [r.projectLocation.trim(), r.towerOrCluster.trim()].filter(Boolean).join(" — "); }
function paymentStatus(r: CSVConsumerRecord): "IN_PROGRESS" | "PAID_OFF" { const status = r.loanPaymentStatus.toLowerCase(); return status.includes("lunas") && !status.includes("belum") ? "PAID_OFF" : "IN_PROGRESS"; }
function parseTimestamp(value: string | undefined) { const result = value ? new Date(value) : null; return result && !Number.isNaN(result.getTime()) ? result : null; }
function accountNumber(value: string) { const result = value.trim(); return result && result !== "-" && result !== "0" ? result : null; }

async function existingKeys() {
  const users = await prisma.user.findMany({ include: { ownershipDocuments: { select: { unitNumber: true } } } });
  const results = new Map<string, { id: string; name: string }>();
  for (const user of users) for (const document of user.ownershipDocuments) {
    const email = normalizeEmail(user.email);
    const phone = normalizePhone(user.contactNumber);
    const unit = normalizeUnitNumber(document.unitNumber);
    if (email && phone && unit) results.set([email, phone, unit].join("|"), { id: user.id, name: user.name });
  }
  return results;
}

export async function analyzeCSVAction(csvContent: string): Promise<{ success: boolean; error?: string; data?: CSVAnalysisResult }> {
  try {
    await requireAdmin();
    const records = parseCSVConsumerRows(csvContent);
    if (!records.length) return { success: false, error: "No valid rows found in the CSV." };
    const existing = await existingKeys();
    const seen = new Set<string>();
    const rows: AnalyzedCSVRow[] = records.map((record, index) => {
      if (!complete(record)) return { index: index + 1, status: "DUPLICATE_IN_CSV", statusReason: "Email, phone, and unit are required.", record };
      const recordKey = key(record);
      if (seen.has(recordKey)) return { index: index + 1, status: "DUPLICATE_IN_CSV", statusReason: "Same email, phone, and unit already appears in this CSV.", record };
      seen.add(recordKey);
      const match = existing.get(recordKey);
      return match
        ? { index: index + 1, status: "MATCHED_EXISTING", statusReason: "Existing record has the same email, phone, and unit.", matchedUserId: match.id, matchedUserName: match.name, record }
        : { index: index + 1, status: "NEW", statusReason: "New consumer record ready to import.", record };
    });
    return { success: true, data: { totalRows: records.length, matchedCount: rows.filter((r) => r.status === "MATCHED_EXISTING").length, newCount: rows.filter((r) => r.status === "NEW").length, duplicateInCsvCount: rows.filter((r) => r.status === "DUPLICATE_IN_CSV").length, rows } };
  } catch (error) {
    console.error("Failed to analyze CSV:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to analyze CSV." };
  }
}

export async function replaceConsumerDataAndImportAction(rows: CSVConsumerRecord[], confirmation: string): Promise<{ success: boolean; importedCount?: number; warning?: string; error?: string }> {
  try {
    await requireAdmin();
    if (confirmation !== "REPLACE") return { success: false, error: 'Type "REPLACE" to confirm the reset.' };
    if (!rows.length) return { success: false, error: "No rows selected for import." };
    const seen = new Set<string>();
    for (const row of rows) {
      if (!complete(row)) return { success: false, error: "Every row needs an email, phone number, and unit number." };
      const rowKey = key(row);
      if (seen.has(rowKey)) return { success: false, error: "The selected rows contain a duplicate email, phone, and unit combination." };
      seen.add(rowKey);
    }

    const media = await prisma.ownershipDocument.findMany({ select: { sppuImagePublicId: true, photos: { select: { publicId: true } } } });
    const mediaIds = media.flatMap((document) => [...(document.sppuImagePublicId ? [document.sppuImagePublicId] : []), ...document.photos.map((photo) => photo.publicId)]);
    const deleteResults = await Promise.allSettled(mediaIds.map((id) => deleteImage(id)));
    const failedDeletes = deleteResults.filter((result) => result.status === "rejected").length;

    await prisma.$transaction(async (tx) => {
      await tx.lead.updateMany({ data: { buildingId: null, convertedUserId: null, convertedAt: null, status: "NEW" } });
      await tx.ownershipDocumentPhoto.deleteMany();
      await tx.ownershipDocument.deleteMany();
      await tx.user.deleteMany();
      await tx.loanBank.deleteMany();
      await tx.building.deleteMany();

      const buildings = new Map<string, string>();
      const banks = new Map<string, string>();
      for (const row of rows) {
        const buildingLabel = buildingName(row);
        let buildingId: string | null = null;
        if (buildingLabel) {
          const buildingKey = buildingLabel.toLocaleLowerCase();
          buildingId = buildings.get(buildingKey) ?? (await tx.building.create({ data: { name: buildingLabel } })).id;
          buildings.set(buildingKey, buildingId);
        }
        const bankLabel = row.loanBankName.trim();
        let loanBankId: string | null = null;
        if (bankLabel) {
          const bankKey = bankLabel.toLocaleLowerCase();
          loanBankId = banks.get(bankKey) ?? (await tx.loanBank.create({ data: { name: bankLabel } })).id;
          banks.set(bankKey, loanBankId);
        }
        const user = await tx.user.create({ data: { name: row.name, email: normalizeEmail(row.email), contactNumber: row.phone.trim(), buildingId, loanBankId, paymentStatus: paymentStatus(row) } });
        const isRefund = row.tuntutan.trim().toLowerCase() === "refund";
        await tx.ownershipDocument.create({ data: { userId: user.id, unitNumber: row.unitNumber.trim(), accountNumber: accountNumber(row.ppjbNumber), sppuNumber: row.sppuNumber.trim() || null, purchasePrice: row.purchasePrice || null, paymentType: isRefund ? row.paymentType || null : null, loanBankName: isRefund ? row.loanBankName || null : null, loanTenorMonths: row.loanTenorMonths, loanMonthsPaid: row.loanMonthsPaid, loanPaymentStatus: isRefund ? row.loanPaymentStatus || null : null, tuntutan: row.tuntutan || null, materialLossPaid: isRefund ? row.materialLossPaid || null : null, materialDetails: row.materialDetails || null, remainingArrears: row.remainingArrears || null, otherLosses: isRefund ? row.otherLosses || null : null, lossBasisCalc: row.lossBasisCalc || null, pinjamPakai: row.pinjamPakai || null, maxWaitDuration: row.maxWaitDuration || null, compensation: row.compensation || null, surveyTimestamp: parseTimestamp(row.timestamp) } });
      }
    });
    revalidatePath("/admin/users"); revalidatePath("/admin/import"); revalidatePath("/users");
    return { success: true, importedCount: rows.length, warning: failedDeletes ? `${failedDeletes} Cloudinary asset(s) could not be removed and may need manual cleanup.` : undefined };
  } catch (error) {
    console.error("Failed to replace consumer data:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to replace consumer data." };
  }
}
