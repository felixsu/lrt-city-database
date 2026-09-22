import { prisma } from "@/lib/prisma";

export type ProjectAnalytics = {
  project: string;
  units: number;
  refund: number;
  waiting: number;
  other: number;
  materialLossPaid: number;
  otherLosses: number;
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
  const cleaned = value.replace(/[^0-9,.-]/g, "");
  if (!cleaned) return 0;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalIndex = Math.max(lastComma, lastDot);
  const hasDecimal = decimalIndex >= 0 && cleaned.length - decimalIndex - 1 <= 2;
  const normalized = hasDecimal
    ? `${cleaned.slice(0, decimalIndex).replace(/[.,-]/g, "")}.${cleaned.slice(decimalIndex + 1).replace(/[^0-9]/g, "")}`
    : cleaned.replace(/[.,-]/g, "");
  return Number.parseFloat(normalized) || 0;
}

export async function getProjectAnalytics(): Promise<ProjectAnalytics[]> {
  const documents = await prisma.ownershipDocument.findMany({
    select: {
      tuntutan: true,
      materialLossPaid: true,
      otherLosses: true,
      user: { select: { building: { select: { name: true } } } },
    },
  });
  const projects = new Map<string, ProjectAnalytics>();
  for (const document of documents) {
    const project = projectLocation(document.user.building?.name);
    const row = projects.get(project) ?? { project, units: 0, refund: 0, waiting: 0, other: 0, materialLossPaid: 0, otherLosses: 0 };
    row.units += 1;
    const demand = demandCategory(document.tuntutan);
    row[demand] += 1;
    if (demand === "refund") {
      row.materialLossPaid += parseRupiah(document.materialLossPaid);
      row.otherLosses += parseRupiah(document.otherLosses);
    }
    projects.set(project, row);
  }
  return [...projects.values()].sort((a, b) => b.units - a.units || a.project.localeCompare(b.project));
}
