"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeCSVAction, replaceConsumerDataAndImportAction, type AnalyzedCSVRow, type CSVAnalysisResult } from "./actions";

export function CSVImportWizard() {
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CSVAnalysisResult | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function analyze(content: string) {
    setError(null); setMessage(null);
    startTransition(async () => {
      const result = await analyzeCSVAction(content);
      if (!result.success || !result.data) { setAnalysis(null); setError(result.error ?? "Analysis failed."); return; }
      setAnalysis(result.data);
    });
  }
  function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => { const content = String(reader.result ?? ""); setCsvText(content); analyze(content); };
    reader.readAsText(file);
  }
  function replace() {
    if (!analysis) return;
    const rows = analysis.rows.filter((row) => row.status !== "DUPLICATE_IN_CSV").map((row) => row.record);
    startTransition(async () => {
      const result = await replaceConsumerDataAndImportAction(rows, confirmation);
      if (!result.success) { setError(result.error ?? "Replacement failed."); return; }
      setError(null); setMessage(`Replaced the consumer dataset with ${result.importedCount} records.${result.warning ? ` ${result.warning}` : ""}`); analyze(csvText);
    });
  }
  return <div className="flex max-w-4xl flex-col gap-6">
    <section className="rounded-xl border border-hairline bg-surface p-6">
      <h2 className="text-lg font-medium text-ink">1. Upload the source CSV</h2>
      <p className="mt-1 text-sm text-muted">A duplicate requires the same email address, WhatsApp number, and unit number.</p>
      <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-hairline bg-surface-soft p-8 text-center hover:border-accent"><UploadCloud className="mb-2 h-7 w-7 text-muted" /><span className="text-sm font-medium text-ink">{fileName ?? "Choose a CSV file"}</span><input type="file" accept=".csv,text/csv" className="hidden" onChange={chooseFile} /></label>
    </section>
    {error && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}
    {analysis && <section className="rounded-xl border border-hairline bg-surface p-6">
      <h2 className="text-lg font-medium text-ink">2. Review and replace</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4"><Metric label="CSV rows" value={analysis.totalRows} /><Metric label="Will import" value={analysis.totalRows - analysis.duplicateInCsvCount} /><Metric label="Existing matches" value={analysis.matchedCount} /><Metric label="Duplicate / incomplete" value={analysis.duplicateInCsvCount} /></div>
      <ConflictReview analysis={analysis} />
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><div className="flex gap-2 font-medium"><AlertTriangle className="h-5 w-5 flex-none" />Replace consumer dataset</div><p className="mt-2">This removes all consumer records, unit documents, associated photos, buildings, and loan banks. Admin accounts, homepage content, timeline, media, resources, and leads are preserved.</p><label className="mt-4 block font-medium">Type REPLACE to continue</label><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1 h-10 w-full max-w-xs rounded-lg border border-red-200 bg-white px-3 font-mono text-sm outline-none focus:border-red-500" /><Button type="button" variant="danger" disabled={isPending || confirmation !== "REPLACE"} onClick={replace} className="mt-4">{isPending ? "Replacing…" : `Replace with ${analysis.totalRows - analysis.duplicateInCsvCount} records`}</Button></div>
    </section>}
  </div>;
}

function ConflictReview({ analysis }: { analysis: CSVAnalysisResult }) {
  const duplicates = analysis.rows.filter((row) => row.status === "DUPLICATE_IN_CSV");
  const existingMatches = analysis.rows.filter((row) => row.status === "MATCHED_EXISTING");
  if (!duplicates.length && !existingMatches.length) return null;

  return <div className="mt-6 space-y-4">
    {duplicates.length > 0 && <ConflictGroup title={`${duplicates.length} row${duplicates.length === 1 ? "" : "s"} excluded from import`} description="These rows repeat an email, WhatsApp number, and unit already found in this CSV, or are missing one of those required values." rows={duplicates} tone="danger" />}
    {existingMatches.length > 0 && <ConflictGroup title={`${existingMatches.length} row${existingMatches.length === 1 ? "" : "s"} match the current database`} description="These are shown for review. They will still be included because replacing the dataset removes the current consumer records first." rows={existingMatches} tone="warning" />}
  </div>;
}

function ConflictGroup({ title, description, rows, tone }: { title: string; description: string; rows: AnalyzedCSVRow[]; tone: "danger" | "warning" }) {
  const classes = tone === "danger" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50";
  return <details open className={`rounded-lg border ${classes}`}><summary className="cursor-pointer px-4 py-3 text-sm font-medium text-ink">{title}</summary><div className="border-t border-current/10 px-4 pb-4"><p className="mt-3 text-sm text-muted">{description}</p><div className="mt-4 space-y-3">{rows.map((row) => <ConflictRow key={row.index} row={row} />)}</div></div></details>;
}

function ConflictRow({ row }: { row: AnalyzedCSVRow }) {
  const { record } = row;
  const project = [record.projectLocation, record.towerOrCluster].filter(Boolean).join(" — ") || "Not specified";
  return <article className="rounded-lg border border-hairline bg-surface p-4 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium text-ink">CSV row {row.index} · {record.name || "No name"}</p>{row.status === "MATCHED_EXISTING" && row.matchedUserId ? <Link href={`/admin/users/${row.matchedUserId}`} className="text-xs font-medium text-accent hover:underline">View current record{row.matchedUserName ? `: ${row.matchedUserName}` : ""}</Link> : null}</div><p className="mt-1 text-sm text-muted">{row.statusReason}</p><dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-4"><ConflictDetail label="Email" value={record.email || "Missing"} /><ConflictDetail label="WhatsApp" value={record.phone || "Missing"} /><ConflictDetail label="Unit" value={record.unitNumber || "Missing"} /><ConflictDetail label="Project" value={project} /></dl></article>;
}

function ConflictDetail({ label, value }: { label: string; value: string }) { return <div><dt className="font-mono text-[10px] tracking-[0.5px] text-muted uppercase">{label}</dt><dd className="mt-0.5 break-words text-ink">{value}</dd></div>; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-hairline bg-surface-soft p-4"><p className="font-mono text-[11px] uppercase text-muted">{label}</p><p className="mt-1 text-2xl font-medium text-ink">{value}</p></div>; }
