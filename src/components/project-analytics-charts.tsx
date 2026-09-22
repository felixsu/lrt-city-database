import { Card } from "@/components/ui/card";
import type { ProjectAnalytics } from "@/lib/consumer-analytics";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function ProjectDemandChart({ rows }: { rows: ProjectAnalytics[] }) {
  const totalUnits = rows.reduce((total, row) => total + row.units, 0);
  const totalRefund = rows.reduce((total, row) => total + row.refund, 0);
  const totalWaiting = rows.reduce((total, row) => total + row.waiting, 0);
  return <Card className="p-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-medium text-ink">Consumer units by project</h2><p className="mt-1 text-sm text-muted">Each bar shows unit population and the recorded Tuntutan split.</p></div><p className="font-mono text-sm text-muted">{totalUnits} units</p></div>
    <div className="mt-5 flex flex-wrap gap-4 font-mono text-[11px] text-muted"><Legend color="bg-accent" label={`Refund · ${totalRefund}`} /><Legend color="bg-[#c98a28]" label={`Waiting for development · ${totalWaiting}`} /><Legend color="bg-hairline" label="Not specified" /></div>
    <div className="mt-6 space-y-4">{rows.map((row) => <div key={row.project}><div className="mb-1.5 flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium text-ink">{row.project}</span><span className="font-mono text-xs text-muted">{row.units} units</span></div><div className="flex h-4 overflow-hidden rounded-sm bg-surface-soft"><Segment count={row.refund} total={row.units} color="bg-accent" /><Segment count={row.waiting} total={row.units} color="bg-[#c98a28]" /><Segment count={row.other} total={row.units} color="bg-hairline" /></div><div className="mt-1 flex flex-wrap gap-x-3 font-mono text-[11px] text-muted"><span>Refund {row.refund}</span><span>Waiting {row.waiting}</span>{row.other > 0 && <span>Other {row.other}</span>}</div></div>)}</div>
  </Card>;
}

export function DisputeValueChart({ rows }: { rows: ProjectAnalytics[] }) {
  const rowsWithValue = rows.filter((row) => row.materialLossPaid > 0 || row.otherLosses > 0);
  const max = Math.max(...rowsWithValue.map((row) => row.materialLossPaid + row.otherLosses), 1);
  const materialTotal = rowsWithValue.reduce((total, row) => total + row.materialLossPaid, 0);
  const otherTotal = rowsWithValue.reduce((total, row) => total + row.otherLosses, 0);
  return <Card className="p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-medium text-ink">Refund dispute value by project</h2><p className="mt-1 text-sm text-muted">Only records with Tuntutan set to Refund are included.</p></div><p className="font-mono text-sm text-muted">{rupiah.format(materialTotal + otherTotal)}</p></div><div className="mt-5 flex flex-wrap gap-4 font-mono text-[11px] text-muted"><Legend color="bg-accent" label={`Material paid · ${rupiah.format(materialTotal)}`} /><Legend color="bg-[#9d4963]" label={`Other material & immaterial · ${rupiah.format(otherTotal)}`} /></div><div className="mt-6 space-y-4">{rowsWithValue.map((row) => { const total = row.materialLossPaid + row.otherLosses; return <div key={row.project}><div className="mb-1.5 flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium text-ink">{row.project}</span><span className="font-mono text-xs text-muted">{rupiah.format(total)}</span></div><div className="flex h-4 overflow-hidden rounded-sm bg-surface-soft" style={{ width: `${Math.max((total / max) * 100, 2)}%` }}><Segment count={row.materialLossPaid} total={total} color="bg-accent" /><Segment count={row.otherLosses} total={total} color="bg-[#9d4963]" /></div></div>; })}</div></Card>;
}

function Segment({ count, total, color }: { count: number; total: number; color: string }) { return count ? <div className={color} style={{ width: `${(count / total) * 100}%` }} /> : null; }
function Legend({ color, label }: { color: string; label: string }) { return <span className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}</span>; }
