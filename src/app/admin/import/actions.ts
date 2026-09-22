"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import {
  parseCSVConsumerRows,
  normalizeEmail,
  normalizePhone,
  normalizeUnitNumber,
  type CSVConsumerRecord,
} from "@/lib/csv-parser";

export type AnalysisRowStatus = "MATCHED_EXISTING" | "NEW";

export interface AnalyzedCSVRow {
  index: number;
  status: AnalysisRowStatus;
  statusReason: string;
  matchedUserId?: string;
  matchedUserName?: string;
  record: CSVConsumerRecord;
}

export interface CSVAnalysisResult {
  totalRows: number;
  matchedCount: number;
  newCount: number;
  rows: AnalyzedCSVRow[];
}

export async function analyzeCSVAction(csvContent: string): Promise<{
  success: boolean;
  error?: string;
  data?: CSVAnalysisResult;
}> {
  try {
    await requireAdmin();

    if (!csvContent || csvContent.trim().length === 0) {
      return { success: false, error: "CSV content is empty." };
    }

    const records = parseCSVConsumerRows(csvContent);
    if (records.length === 0) {
      return { success: false, error: "No valid rows found in the CSV." };
    }

    // Fetch existing users and their ownership documents to match against
    const existingUsers = await prisma.user.findMany({
      include: {
        ownershipDocuments: {
          select: { id: true, unitNumber: true, sppuNumber: true, accountNumber: true },
        },
        building: { select: { id: true, name: true } },
      },
    });

    const analyzedRows: AnalyzedCSVRow[] = [];
    let matchedCount = 0;
    let newCount = 0;

    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const normEmail = normalizeEmail(rec.email);
      const normPhone = normalizePhone(rec.phone);
      const normUnit = normalizeUnitNumber(rec.unitNumber);

      // Find if any existing user matches by phone, email, and unit number
      // "the key is in the phone number, email, and unit number. If they are the same, then it is considered as same row and we should skip the import for those cases."
      let matchedUser: (typeof existingUsers)[0] | undefined;
      let matchedReason = "";

      for (const u of existingUsers) {
        const uPhone = normalizePhone(u.contactNumber);
        const uEmail = normalizeEmail(u.email);

        const phoneMatches = normPhone.length > 0 && uPhone.length > 0 && normPhone === uPhone;
        const emailMatches = normEmail.length > 0 && uEmail.length > 0 && normEmail === uEmail;

        // Check if any of the user's unit numbers match
        const unitMatches = u.ownershipDocuments.some((doc) => {
          const docUnit = normalizeUnitNumber(doc.unitNumber);
          return normUnit.length > 0 && docUnit.length > 0 && docUnit === normUnit;
        });

        // Exact match rule: phone, email, AND unit number are all the same
        if (phoneMatches && emailMatches && unitMatches) {
          matchedUser = u;
          matchedReason = `Existing record found: same email (${rec.email}), phone (${rec.phone}), and unit (${rec.unitNumber}) for ${u.name}`;
          break;
        }

        // Also if unit and (phone or email) match exactly, flag it
        if (unitMatches && (phoneMatches || emailMatches)) {
          matchedUser = u;
          matchedReason = `Existing record found: matching unit (${rec.unitNumber}) & ${phoneMatches ? "phone" : "email"} for ${u.name}`;
          break;
        }
      }

      if (matchedUser) {
        matchedCount++;
        analyzedRows.push({
          index: i + 1,
          status: "MATCHED_EXISTING",
          statusReason: matchedReason,
          matchedUserId: matchedUser.id,
          matchedUserName: matchedUser.name,
          record: rec,
        });
      } else {
        newCount++;
        analyzedRows.push({
          index: i + 1,
          status: "NEW",
          statusReason: "New consumer / unit record ready to import",
          record: rec,
        });
      }
    }

    return {
      success: true,
      data: {
        totalRows: records.length,
        matchedCount,
        newCount,
        rows: analyzedRows,
      },
    };
  } catch (err: unknown) {
    console.error("Failed to analyze CSV:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to analyze CSV.",
    };
  }
}

export async function commitCSVImportAction(
  rowsToImport: CSVConsumerRecord[]
): Promise<{ success: boolean; importedCount?: number; error?: string }> {
  try {
    await requireAdmin();

    if (!rowsToImport || rowsToImport.length === 0) {
      return { success: false, error: "No rows selected for import." };
    }

    // Pre-fetch buildings and loan banks to map or create
    const allBuildings = await prisma.building.findMany();
    const allLoanBanks = await prisma.loanBank.findMany();

    const buildingMap = new Map<string, string>(); // lowercase name -> id
    allBuildings.forEach((b) => buildingMap.set(b.name.toLowerCase().trim(), b.id));

    const bankMap = new Map<string, string>(); // lowercase name -> id
    allLoanBanks.forEach((b) => bankMap.set(b.name.toLowerCase().trim(), b.id));

    let importedCount = 0;

    for (const rec of rowsToImport) {
      // 1. Match or create Building
      let buildingId: string | null = null;
      const buildingName = rec.projectLocation.trim();
      if (buildingName) {
        const key = buildingName.toLowerCase();
        if (buildingMap.has(key)) {
          buildingId = buildingMap.get(key)!;
        } else {
          // Attempt fuzzy match or create building
          try {
            const newBld = await prisma.building.create({
              data: { name: buildingName },
            });
            buildingId = newBld.id;
            buildingMap.set(key, newBld.id);
          } catch {
            const existing = await prisma.building.findFirst({
              where: { name: { equals: buildingName, mode: "insensitive" } },
            });
            if (existing) {
              buildingId = existing.id;
              buildingMap.set(key, existing.id);
            }
          }
        }
      }

      // 2. Match or create LoanBank
      let loanBankId: string | null = null;
      const bankName = rec.loanBankName.trim();
      if (bankName) {
        const key = bankName.toLowerCase();
        if (bankMap.has(key)) {
          loanBankId = bankMap.get(key)!;
        } else {
          try {
            const newBank = await prisma.loanBank.create({
              data: { name: bankName },
            });
            loanBankId = newBank.id;
            bankMap.set(key, newBank.id);
          } catch {
            const existing = await prisma.loanBank.findFirst({
              where: { name: { equals: bankName, mode: "insensitive" } },
            });
            if (existing) {
              loanBankId = existing.id;
              bankMap.set(key, existing.id);
            }
          }
        }
      }

      // 3. Determine PaymentStatus enum
      // If loanPaymentStatus says "Sudah Lunas", mark as PAID_OFF
      let paymentStatus: "IN_PROGRESS" | "PAID_OFF" = "IN_PROGRESS";
      if (
        rec.loanPaymentStatus.toLowerCase().includes("lunas") &&
        !rec.loanPaymentStatus.toLowerCase().includes("belum")
      ) {
        paymentStatus = "PAID_OFF";
      }

      // Check if user already exists with matching phone & email
      const normEmail = normalizeEmail(rec.email);

      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { contactNumber: rec.phone },
            ...(normEmail ? [{ email: { equals: normEmail, mode: "insensitive" as const } }] : []),
          ],
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: rec.name || "Unnamed Consumer",
            email: rec.email || null,
            contactNumber: rec.phone || "-",
            buildingId,
            loanBankId,
            paymentStatus,
            remarks: rec.remarks || rec.materialDetails || null,
          },
        });
      } else {
        // Update user's email or building if missing
        await prisma.user.update({
          where: { id: user.id },
          data: {
            email: user.email || rec.email || null,
            buildingId: user.buildingId || buildingId,
            loanBankId: user.loanBankId || loanBankId,
          },
        });
      }

      // 4. Create OwnershipDocument with all new survey columns
      let surveyTimestamp: Date | null = null;
      if (rec.timestamp) {
        const parsed = new Date(rec.timestamp);
        if (!isNaN(parsed.getTime())) {
          surveyTimestamp = parsed;
        }
      }

      // Verify if accountNumber (PPJB) is unique before assigning
      let accountNumber = rec.ppjbNumber.trim() || null;
      if (accountNumber === "-" || accountNumber === "0" || accountNumber === "") {
        accountNumber = null;
      }

      if (accountNumber) {
        const existingDoc = await prisma.ownershipDocument.findUnique({
          where: { accountNumber },
        });
        if (existingDoc) {
          // append user/unit id to keep unique if duplicate in source
          accountNumber = `${accountNumber} (${rec.unitNumber || "dup"})`;
        }
      }

      await prisma.ownershipDocument.create({
        data: {
          userId: user.id,
          unitNumber: rec.unitNumber || null,
          accountNumber,
          sppuNumber: rec.sppuNumber || null,
          purchasePrice: rec.purchasePrice || null,
          paymentType: rec.paymentType || null,
          loanBankName: rec.loanBankName || null,
          loanTenorMonths: rec.loanTenorMonths,
          loanMonthsPaid: rec.loanMonthsPaid,
          loanPaymentStatus: rec.loanPaymentStatus || null,
          demandType: rec.demandType || null,
          materialLossPaid: rec.materialLossPaid || null,
          materialDetails: rec.materialDetails || null,
          remainingArrears: rec.remainingArrears || null,
          otherLosses: rec.otherLosses || null,
          lossBasisCalc: rec.lossBasisCalc || null,
          pinjamPakai: rec.pinjamPakai || null,
          maxWaitDuration: rec.maxWaitDuration || null,
          compensation: rec.compensation || null,
          surveyTimestamp,
        },
      });

      importedCount++;
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/import");
    revalidatePath("/users");

    return { success: true, importedCount };
  } catch (err: unknown) {
    console.error("Failed to commit CSV import:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to commit import.",
    };
  }
}
