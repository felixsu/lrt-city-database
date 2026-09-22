import { Card } from "@/components/ui/card";
import type { ProjectAnalytics } from "@/lib/consumer-analytics";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const colors = { refund: "bg-[#007a6e]", waiting: "bg-[#e06c2e]", other: "bg-[#667085]", material: "bg-[#007a6e]", losses: "bg-[#9b3f5b]" };

export function ProjectDemandChart({ rows }: { rows: ProjectAnalytics[] }) {
  const max = Math.max(...rows.map((row) => row.units), 1);
  const totalUnits = rows.reduce((total, row) => total + row.units, 0);
  const totalRefund = rows.reduce((total, row) => total + row.refund, 0);
  const totalWaiting = rows.reduce((total, row) => total + row.waiting, 0);
  return <Card className="p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-medium text-ink">Consumer units by project</h2><p className="mt-1 text-sm text-muted">Unit population with Tuntutan shown in high-contrast stacked columns.</p></div><p className="font-mono text-sm text-muted">{totalUnits} units</p></div><div className="mt-5 flex flex-wrap gap-4 font-mono text-[11px] text-muted"><Legend color={colors.refund} label={`Refund · ${totalRefund}`} /><Legend color={colors.waiting} label={`Waiting for development · ${totalWaiting}`} /><Legend color={colors.other} label="Not specified" /></div><div className="mt-7 overflow-x-auto"><div className="flex min-w-[680px] items-end gap-3 border-b border-hairline pb-2" style={{ height: 310 }}>{rows.map((row) => <div key={row.project} className="flex min-w-16 flex-1 flex-col justify-end self-stretch"><div className="mb-2 text-center font-mono text-xs text-ink">{row.units}</div><div className="flex h-60 flex-col justify-end overflow-hidden rounded-t-md bg-surface-soft"><VerticalSegment value={row.refund} max={max} color={colors.refund} /><VerticalSegment value={row.waiting} max={max} color={colors.waiting} /><VerticalSegment value={row.other} max={max} color={colors.other} /></div><div title={row.project} className="mt-2 line-clamp-2 min-h-8 text-center text-[11px] leading-tight text-muted">{row.project}</div></div>)}</div></div></Card>;
}

export function DisputeValueChart({ rows }: { rows: ProjectAnalytics[] }) {
  const values = rows.filter((row) => row.materialLossPaid > 0 || row.otherLosses > 0);
  const max = Math.max(...values.map((row) => row.materialLossPaid + row.otherLosses), 1);
  const materialTotal = values.reduce((total, row) => total + row.materialLossPaid, 0);
  const otherTotal = values.reduce((total, row) => total + row.otherLosses, 0);
  return <Card className="p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-medium text-ink">Refund dispute value by project</h2><p className="mt-1 text-sm text-muted">Only numeric Refund values are included. Textual or formula entries are omitted.</p></div><p className="font-mono text-sm text-muted">{rupiah.format(materialTotal + otherTotal)}</p></div><div className="mt-5 flex flex-wrap gap-4 font-mono text-[11px] text-muted"><Legend color={colors.material} label={`Material paid · ${rupiah.format(materialTotal)}`} /><Legend color={colors.losses} label={`Other material & immaterial · ${rupiah.format(otherTotal)}`} /></div><div className="mt-6 space-y-4">{values.map((row) => { const total = row.materialLossPaid + row.otherLosses; return <div key={row.project}><div className="mb-1.5 flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium text-ink">{row.project}</span><span className="font-mono text-xs text-muted">{rupiah.format(total)}</span></div><div className="flex h-5 overflow-hidden rounded-sm bg-surface-soft" style={{ width: `${Math.max((total / max) * 100, 2)}%` }}><HorizontalSegment value={row.materialLossPaid} total={total} color={colors.material} /><HorizontalSegment value={row.otherLosses} total={total} color={colors.losses} /></div></div>; })}</div></Card>;
}

function VerticalSegment({ value, max, color }: { value: number; max: number; color: string }) { return value ? <div className={color} style={{ height: `${(value / max) * 100}%` }} /> : null; }
function HorizontalSegment({ value, total, color }: { value: number; total: number; color: string }) { return value ? <div className={color} style={{ width: `${(value / total) * 100}%` }} /> : null; }
function Legend({ color, label }: { color: string; label: string }) { return <span className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}</span>; }
