import { ProjectDemandChart, DisputeValueChart } from "@/components/project-analytics-charts";
import { getProjectAnalytics } from "@/lib/consumer-analytics";
import { requireAdmin } from "@/lib/require-admin";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const rows = await getProjectAnalytics();
  return <div className="flex max-w-6xl flex-col gap-6"><div><h1 className="text-[26px]">Consumer analytics</h1><p className="mt-1 text-sm text-muted">Population, Tuntutan, and Refund dispute values grouped by project location.</p></div>{rows.length > 0 && <><ProjectDemandChart rows={rows} /><DisputeValueChart rows={rows} /></>}</div>;
}
