import { prisma } from "@/lib/prisma";

export type ProjectAnalytics = {
  project: string;
  consumers: number;
  units: number;
  refund: number;
  waiting: number;
  other: number;
  materialLossPaid: number;
  contractValue: number;
};

function projectLocation(buildingName: string | null | undefined) {
  return buildingName?.split(" — ")[0]?.trim() || "Unassigned";
}

function demandCategory(value: string | null) {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "refund") return "refund";
  if (normalized === "menunggu pembangunan selesai") return "waiting";
  return "other";
}

export function parseRupiah(value: string | null) {
  if (!value) return 0;
  const source = value.trim();
  if (!/^(?:rp\s*)?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?$/i.test(source) && !/^\d+(?:\.\d{1,2})?$/.test(source)) return 0;
  const cleaned = source.replace(/^rp\s*/i, "").replace(/,/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalIndex = Math.max(lastComma, lastDot);
  const hasDecimal = decimalIndex >= 0 && cleaned.length - decimalIndex - 1 <= 2;
  const normalized = hasDecimal
    ? `${cleaned.slice(0, decimalIndex).replace(/[.,-]/g, "")}.${cleaned.slice(decimalIndex + 1).replace(/[^0-9]/g, "")}`
    : cleaned.replace(/[.,-]/g, "");
  return Number.parseFloat(normalized) || 0;
}

export function normalizeCurrency(value: string) {
  const parsed = parseRupiah(value);
  return parsed > 0 || /^\s*0(?:[.,]0{1,2})?\s*$/.test(value) ? parsed.toFixed(2) : null;
}

export async function getProjectAnalytics(): Promise<ProjectAnalytics[]> {
  const documents = await prisma.ownershipDocument.findMany({
    select: {
      tuntutan: true,
      materialLossPaid: true,
      contractValue: true,
      user: { select: { id: true, building: { select: { name: true } } } },
    },
  });
  const projects = new Map<string, ProjectAnalytics & { consumerIds: Set<string> }>();
  for (const document of documents) {
    const project = projectLocation(document.user.building?.name);
    const row = projects.get(project) ?? { project, consumers: 0, units: 0, refund: 0, waiting: 0, other: 0, materialLossPaid: 0, contractValue: 0, consumerIds: new Set<string>() };
    row.units += 1;
    row.consumerIds.add(document.user.id);
    row.contractValue += parseRupiah(document.contractValue);
    const demand = demandCategory(document.tuntutan);
    row[demand] += 1;
    if (demand === "refund") {
      row.materialLossPaid += parseRupiah(document.materialLossPaid);
    }
    projects.set(project, row);
  }
  return [...projects.values()]
    .map(({ consumerIds, ...row }) => ({ ...row, consumers: consumerIds.size }))
    .sort((a, b) => b.units - a.units || a.project.localeCompare(b.project));
}
