import { Card } from "@/components/ui/card";
import type { ProjectAnalytics } from "@/lib/consumer-analytics";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const colors = {
  refund: "bg-[#007a6e]",
  waiting: "bg-[#e06c2e]",
  other: "bg-[#667085]",
  paymentStopped: "bg-[#b42318]",
  paymentActive: "bg-[#007a6e]",
  paymentPaidOff: "bg-[#175cd3]",
  paymentOther: "bg-[#667085]",
};

export function ProjectDemandChart({ rows }: { rows: ProjectAnalytics[] }) {
  const totalUnits = rows.reduce((total, row) => total + row.units, 0);
  const totalRefund = rows.reduce((total, row) => total + row.refund, 0);
  const totalWaiting = rows.reduce((total, row) => total + row.waiting, 0);
  const totalOther = rows.reduce((total, row) => total + row.other, 0);

  return <Card className="p-6"><ChartHeading title="Unit decisions by project" description="Each bar represents all recorded units at a project location, split by Tuntutan." total={`${totalUnits} units`} /><div className="mt-5 flex flex-wrap gap-4 font-mono text-[11px] text-muted"><Legend color={colors.refund} label={`Refund · ${totalRefund}`} /><Legend color={colors.waiting} label={`Waiting for development · ${totalWaiting}`} /><Legend color={colors.other} label={`Not specified · ${totalOther}`} /></div><div className="mt-6 space-y-5">{rows.map((row) => <StackedBar key={row.project} label={row.project} total={row.units} segments={[{ color: colors.refund, label: "Refund", value: row.refund }, { color: colors.waiting, label: "Waiting for development", value: row.waiting }, { color: colors.other, label: "Not specified", value: row.other }]} />)}</div></Card>;
}

export function ProjectPaymentStatusChart({ rows }: { rows: ProjectAnalytics[] }) {
  const totalUnits = rows.reduce((total, row) => total + row.units, 0);
  const totalStopped = rows.reduce((total, row) => total + row.paymentStopped, 0);
  const totalActive = rows.reduce((total, row) => total + row.paymentActive, 0);
  const totalPaidOff = rows.reduce((total, row) => total + row.paymentPaidOff, 0);
  const totalOther = rows.reduce((total, row) => total + row.paymentOther, 0);

  return <Card className="p-6"><ChartHeading title="KPA payment status by project" description="A comparison of recorded Status Pembayaran KPA for every unit." total={`${totalUnits} units`} /><div className="mt-5 flex flex-wrap gap-4 font-mono text-[11px] text-muted"><Legend color={colors.paymentStopped} label={`Stopped payments · ${totalStopped}`} /><Legend color={colors.paymentActive} label={`Active payments · ${totalActive}`} /><Legend color={colors.paymentPaidOff} label={`Paid off · ${totalPaidOff}`} /><Legend color={colors.paymentOther} label={`Not recorded · ${totalOther}`} /></div><div className="mt-6 space-y-5">{rows.map((row) => <StackedBar key={row.project} label={row.project} total={row.units} segments={[{ color: colors.paymentStopped, label: "Stopped payments", value: row.paymentStopped }, { color: colors.paymentActive, label: "Active payments", value: row.paymentActive }, { color: colors.paymentPaidOff, label: "Paid off", value: row.paymentPaidOff }, { color: colors.paymentOther, label: "Not recorded", value: row.paymentOther }]} />)}</div></Card>;
}

export function ProjectFinancialSummary({ rows }: { rows: ProjectAnalytics[] }) {
  const totals = rows.reduce((result, row) => ({ consumers: result.consumers + row.consumers, units: result.units + row.units, materialLossPaid: result.materialLossPaid + row.materialLossPaid, contractValue: result.contractValue + row.contractValue }), { consumers: 0, units: 0, materialLossPaid: 0, contractValue: 0 });
  return <Card className="overflow-x-auto"><div className="border-b border-hairline p-6"><h2 className="text-lg font-medium text-ink">Project financial summary</h2><p className="mt-1 text-sm text-muted">Material paid includes numeric Refund values only. Contract value is summed across all units.</p></div><table className="min-w-[780px] w-full text-left text-sm"><thead className="bg-surface-soft font-mono text-[11px] tracking-[0.5px] text-muted uppercase"><tr><th className="px-6 py-3">Project location</th><th className="px-4 py-3 text-right">Consumers</th><th className="px-4 py-3 text-right">Units</th><th className="px-4 py-3 text-right">Material paid</th><th className="px-6 py-3 text-right">Nilai Kontrak Unit</th></tr></thead><tbody className="divide-y divide-hairline-soft">{rows.map((row) => <tr key={row.project}><td className="px-6 py-4 font-medium text-ink">{row.project}</td><td className="px-4 py-4 text-right font-mono text-ink">{row.consumers}</td><td className="px-4 py-4 text-right font-mono text-ink">{row.units}</td><td className="px-4 py-4 text-right font-mono text-ink">{rupiah.format(row.materialLossPaid)}</td><td className="px-6 py-4 text-right font-mono text-ink">{rupiah.format(row.contractValue)}</td></tr>)}</tbody><tfoot className="border-t-2 border-ink bg-surface-soft font-medium text-ink"><tr><td className="px-6 py-4">Total</td><td className="px-4 py-4 text-right font-mono">{totals.consumers}</td><td className="px-4 py-4 text-right font-mono">{totals.units}</td><td className="px-4 py-4 text-right font-mono">{rupiah.format(totals.materialLossPaid)}</td><td className="px-6 py-4 text-right font-mono">{rupiah.format(totals.contractValue)}</td></tr></tfoot></table></Card>;
}

function ChartHeading({ title, description, total }: { title: string; description: string; total: string }) {
  return <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-medium text-ink">{title}</h2><p className="mt-1 text-sm text-muted">{description}</p></div><p className="font-mono text-sm text-muted">{total}</p></div>;
}

function StackedBar({ label, total, segments }: { label: string; total: number; segments: { color: string; label: string; value: number }[] }) {
  return <div><div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-sm"><span className="font-medium text-ink">{label}</span><span className="font-mono text-xs text-muted">{total} units</span></div><div className="flex h-5 overflow-hidden rounded-sm bg-surface-soft">{segments.map((segment) => segment.value ? <div key={segment.label} className={segment.color} style={{ width: `${(segment.value / total) * 100}%` }} title={`${segment.label}: ${segment.value}`} /> : null)}</div></div>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}</span>;
}
