import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { ProjectDemandChart, ProjectPaymentStatusChart } from "@/components/project-analytics-charts";
import { getProjectAnalytics } from "@/lib/consumer-analytics";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Consumer Overview", description: "Overview of LRT City consumer units and demands by project location." };

export default async function DashboardPage() {
  const rows = await getProjectAnalytics();
  return <PublicShell><div className="h-1.5 bg-accent" /><div className="mx-auto max-w-[1320px] px-6 py-12 md:px-16"><h1 className="text-[32px]">Consumer overview</h1><p className="mt-1 mb-7 text-sm text-muted">A high-level view of recorded consumer units, their Tuntutan decisions, and KPA payment status across project locations.</p>{rows.length > 0 && <div className="space-y-6"><ProjectDemandChart rows={rows} /><ProjectPaymentStatusChart rows={rows} /></div>}</div></PublicShell>;
}
