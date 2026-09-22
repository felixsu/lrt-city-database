"use client";

import { useState, useEffect, useTransition } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  SkipForward,
  Database,
  ArrowRight,
  RefreshCw,
  Eye,
  Filter,
  X,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  analyzeCSVAction,
  commitCSVImportAction,
  type CSVAnalysisResult,
} from "./actions";

export function CSVImportWizard({
  sampleCsvData,
}: {
  sampleCsvData?: string;
}) {
  const [csvText, setCsvText] = useState(sampleCsvData ?? "");
  const [fileName, setFileName] = useState<string | null>(sampleCsvData ? "sample_lrt_consumers.csv" : null);
  const [analysis, setAnalysis] = useState<CSVAnalysisResult | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "NEW" | "MATCHED">("ALL");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const [isAnalyzing, startAnalyzeTransition] = useTransition();
  const [isCommitting, startCommitTransition] = useTransition();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowSummaryModal(false);
      }
    }
    if (showSummaryModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showSummaryModal]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      // Auto analyze when uploaded
      runAnalysis(content);
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read file.");
    };
    reader.readAsText(file);
  }

  function handlePasteAnalyze() {
    if (!csvText.trim()) {
      setErrorMsg("Please paste or upload CSV data first.");
      return;
    }
    runAnalysis(csvText);
  }

  function runAnalysis(content: string) {
    setErrorMsg(null);
    setSuccessMsg(null);
    startAnalyzeTransition(async () => {
      const res = await analyzeCSVAction(content);
      if (!res.success || !res.data) {
        setErrorMsg(res.error ?? "Failed to analyze CSV.");
        setAnalysis(null);
      } else {
        setAnalysis(res.data);
        setShowSummaryModal(true);
      }
    });
  }

  function handleCommit() {
    if (!analysis) return;
    const newRowsToCommit = analysis.rows
      .filter((r) => r.status === "NEW")
      .map((r) => r.record);

    if (newRowsToCommit.length === 0) {
      setErrorMsg("No new rows to commit! All rows matched existing records and will be skipped.");
      return;
    }

    startCommitTransition(async () => {
      const res = await commitCSVImportAction(newRowsToCommit);
      if (!res.success) {
        setErrorMsg(res.error ?? "Failed to commit changes.");
      } else {
        setSuccessMsg(
          `Successfully imported ${res.importedCount} new consumers & unit records! Existing matching rows were skipped.`
        );
        // Refresh analysis with current state
        runAnalysis(csvText);
      }
    });
  }

  const filteredRows = analysis
    ? analysis.rows.filter((row) => {
        if (selectedFilter === "NEW") return row.status === "NEW";
        if (selectedFilter === "MATCHED") return row.status === "MATCHED_EXISTING";
        return true;
      })
    : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Step 1: Upload & Input Card */}
      <div className="rounded-xl border border-hairline bg-surface p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-ink flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-accent" />
              1. Select or Paste CSV Data
            </h2>
            <p className="mt-1 text-sm text-muted">
              Matches existing data against <strong>Phone Number, Email, and Unit Number</strong>.
              Identical records will be safely skipped.
            </p>
          </div>
          {sampleCsvData && (
            <button
              type="button"
              onClick={() => {
                setCsvText(sampleCsvData);
                setFileName("sample_lrt_consumers.csv");
                runAnalysis(sampleCsvData);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Load Latest Survey Data
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload Area */}
          <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-hairline hover:border-accent/60 bg-surface-soft/40 p-6 text-center cursor-pointer transition-colors">
            <UploadCloud className="h-8 w-8 text-muted mb-2" />
            <span className="text-sm font-medium text-ink">
              {fileName ? fileName : "Upload CSV file"}
            </span>
            <span className="mt-1 text-xs text-muted">Drag & drop or click to select (.csv)</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Paste CSV Box */}
          <div className="flex flex-col">
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste raw CSV content here with headers..."
              className="w-full flex-1 rounded-lg border border-hairline bg-surface px-3 py-2 font-mono text-xs outline-none focus:border-accent resize-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted font-mono">
            {csvText ? `${csvText.split("\n").filter((l) => l.trim()).length} lines detected` : "No data"}
          </span>
          <Button
            onClick={handlePasteAnalyze}
            disabled={isAnalyzing || !csvText.trim()}
            variant="primary"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing Database...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" /> Analyze & Compare with DB
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-none mt-0.5" />
          <div>
            <h3 className="font-semibold">Import Notice</h3>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 flex-none mt-0.5" />
          <div>
            <h3 className="font-semibold">Import Committed</h3>
            <p className="mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Step 2: Analysis & Review Step */}
      {analysis && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-hairline bg-surface p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-ink flex items-center gap-2">
                  <Database className="h-5 w-5 text-accent" />
                  2. Review Analysis & Comparison
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Review matched existing rows vs. newly detected rows before committing to the database.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowSummaryModal(true)}
                  className="inline-flex items-center gap-1.5"
                >
                  <BarChart3 className="h-4 w-4" /> View Summary
                </Button>
                <Button
                  onClick={handleCommit}
                  disabled={isCommitting || analysis.newCount === 0}
                  variant="primary"
                >
                  {isCommitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Committing Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Commit {analysis.newCount} New Records
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Metric Overview Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-hairline bg-surface-soft p-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  Total CSV Records
                </span>
                <p className="mt-1 text-2xl font-semibold text-ink">{analysis.totalRows}</p>
              </div>

              <div className="rounded-lg border border-hairline bg-emerald-50/50 p-4">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ready to Import (New)
                </span>
                <p className="mt-1 text-2xl font-semibold text-emerald-800">
                  {analysis.newCount}
                </p>
                <span className="text-xs text-emerald-600">Will be created in database</span>
              </div>

              <div className="rounded-lg border border-hairline bg-amber-50/40 p-4">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold flex items-center gap-1.5">
                  <SkipForward className="h-3.5 w-3.5" /> Already in Database (Skip)
                </span>
                <p className="mt-1 text-2xl font-semibold text-amber-800">
                  {analysis.matchedCount}
                </p>
                <span className="text-xs text-amber-700">Same Phone + Email + Unit</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-6 flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted" />
                <span className="text-xs font-medium text-muted uppercase">Filter:</span>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("ALL")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                    selectedFilter === "ALL"
                      ? "bg-accent text-white"
                      : "bg-surface-soft text-ink hover:bg-hairline"
                  }`}
                >
                  All ({analysis.totalRows})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("NEW")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                    selectedFilter === "NEW"
                      ? "bg-emerald-600 text-white"
                      : "bg-surface-soft text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  New ({analysis.newCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("MATCHED")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                    selectedFilter === "MATCHED"
                      ? "bg-amber-600 text-white"
                      : "bg-surface-soft text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  Matched Existing ({analysis.matchedCount})
                </button>
              </div>
            </div>

            {/* Rows Table */}
            <div className="mt-4 overflow-x-auto rounded-lg border border-hairline">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-soft font-mono uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2.5 w-12">#</th>
                    <th className="px-3 py-2.5">Status & Action</th>
                    <th className="px-3 py-2.5">Name</th>
                    <th className="px-3 py-2.5">Email</th>
                    <th className="px-3 py-2.5">Phone (WA)</th>
                    <th className="px-3 py-2.5">Project / Building</th>
                    <th className="px-3 py-2.5">Unit</th>
                    <th className="px-3 py-2.5">Payment Type</th>
                    <th className="px-3 py-2.5">Demand</th>
                    <th className="px-3 py-2.5 w-16">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredRows.map((row) => (
                    <>
                      <tr
                        key={row.index}
                        className={
                          row.status === "MATCHED_EXISTING"
                            ? "bg-amber-50/20 hover:bg-amber-50/40"
                            : "bg-emerald-50/10 hover:bg-emerald-50/30"
                        }
                      >
                        <td className="px-3 py-2.5 font-mono text-muted">{row.index}</td>
                        <td className="px-3 py-2.5">
                          {row.status === "MATCHED_EXISTING" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                              <SkipForward className="h-3 w-3" /> Exists (Skip)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" /> New (Import)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-ink">{row.record.name || "—"}</td>
                        <td className="px-3 py-2.5 text-muted font-mono">{row.record.email || "—"}</td>
                        <td className="px-3 py-2.5 text-ink font-mono">{row.record.phone || "—"}</td>
                        <td className="px-3 py-2.5 text-ink">{row.record.projectLocation || "—"}</td>
                        <td className="px-3 py-2.5 font-mono font-medium text-ink">
                          {row.record.unitNumber || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-muted">{row.record.paymentType || "—"}</td>
                        <td className="px-3 py-2.5 text-muted">{row.record.demandType || "—"}</td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRow(expandedRow === row.index ? null : row.index)
                            }
                            className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {expandedRow === row.index ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded View for all new columns */}
                      {expandedRow === row.index && (
                        <tr className="bg-surface-soft/60">
                          <td colSpan={10} className="p-4">
                            <div className="rounded-lg border border-hairline bg-surface p-4 text-xs space-y-3">
                              <div className="font-semibold text-ink flex items-center justify-between border-b border-hairline pb-2">
                                <span>Complete Row Metadata & Integrated Columns</span>
                                <span className="text-muted font-normal">
                                  {row.statusReason}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <span className="text-muted block">Nomor SPPU:</span>
                                  <span className="font-mono text-ink">
                                    {row.record.sppuNumber || "—"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted block">Nomor PPJB/SSKK:</span>
                                  <span className="font-mono text-ink">
                                    {row.record.ppjbNumber || "—"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted block">Harga Pembelian Unit:</span>
                                  <span className="font-medium text-ink">
                                    {row.record.purchasePrice || "—"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted block">Bank KPR / KPA:</span>
                                  <span className="text-ink">{row.record.loanBankName || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-muted block">Tenor / Bulan Terbayar:</span>
                                  <span className="text-ink">
                                    {row.record.loanTenorMonths ?? "—"} bulan /{" "}
                                    {row.record.loanMonthsPaid ?? "—"} dibayar
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted block">Status Pembayaran KPA:</span>
                                  <span className="text-ink">
                                    {row.record.loanPaymentStatus || "—"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted block">Kerugian Materiil Dibayar:</span>
                                  <span className="font-medium text-red-600">
                                    {row.record.materialLossPaid || "—"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted block">Sisa Tunggakan:</span>
                                  <span className="font-medium text-ink">
                                    {row.record.remainingArrears || "—"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted block">Kerugian Imateriil / Lainnya:</span>
                                  <span className="font-medium text-ink">
                                    {row.record.otherLosses || "—"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted block">Pinjam Pakai:</span>
                                  <span className="text-ink">{row.record.pinjamPakai || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-muted block">Maksimal Bersedia Menunggu:</span>
                                  <span className="text-ink">
                                    {row.record.maxWaitDuration || "—"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted block">Kompensasi:</span>
                                  <span className="text-ink">{row.record.compensation || "—"}</span>
                                </div>
                              </div>

                              {row.record.materialDetails && (
                                <div className="border-t border-hairline pt-2">
                                  <span className="text-muted block">Rincian Kerugian Materiil:</span>
                                  <p className="mt-1 whitespace-pre-wrap font-mono text-[11px] text-ink bg-surface-soft p-2 rounded">
                                    {row.record.materialDetails}
                                  </p>
                                </div>
                              )}

                              {row.record.lossBasisCalc && (
                                <div className="border-t border-hairline pt-2">
                                  <span className="text-muted block">Dasar Perhitungan Kerugian Immateriil:</span>
                                  <p className="mt-1 whitespace-pre-wrap font-mono text-[11px] text-ink bg-surface-soft p-2 rounded">
                                    {row.record.lossBasisCalc}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal Dialog */}
      {showSummaryModal && analysis && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSummaryModal(false);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-hairline bg-surface p-6 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent flex-none">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">CSV Parsing & Matching Summary</h3>
                  <p className="text-xs text-muted mt-0.5">
                    Comparison complete against existing database records
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-soft hover:text-ink transition-colors"
                aria-label="Close summary modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Matching Criteria Banner */}
            <div className="rounded-xl border border-blue-200/60 bg-blue-50/40 p-3.5 text-xs text-blue-950 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-blue-600 flex-none mt-0.5" />
              <div>
                <span className="font-semibold block text-blue-950">Matching Criteria:</span>
                <p className="mt-0.5 leading-relaxed text-blue-900/90">
                  Records are evaluated against existing data using <strong>Phone Number (WhatsApp)</strong>,{" "}
                  <strong>Email</strong>, and <strong>Unit Number</strong>. If all three match an
                  existing record, it is categorized as a duplicate and skipped.
                </p>
              </div>
            </div>

            {/* Summary Count Cards */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* New Records Card */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    New
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    To Import
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-emerald-900">{analysis.newCount}</span>
                  <p className="mt-1 text-xs text-emerald-700">
                    New consumer & unit records ready to import.
                  </p>
                </div>
              </div>

              {/* Duplicate Records Card */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <SkipForward className="h-4 w-4 text-amber-600" />
                    Duplicates
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    To Skip
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-amber-900">{analysis.matchedCount}</span>
                  <p className="mt-1 text-xs text-amber-700">
                    Identical phone, email, and unit number.
                  </p>
                </div>
              </div>
            </div>

            {/* Progress & Distribution */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted">
                <span>Total records parsed: <strong>{analysis.totalRows}</strong></span>
                <span>
                  {analysis.totalRows > 0
                    ? `${analysis.newCount} new (${Math.round((analysis.newCount / analysis.totalRows) * 100)}%)`
                    : "0%"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft flex">
                {analysis.totalRows > 0 && (
                  <>
                    <div
                      style={{ width: `${(analysis.newCount / analysis.totalRows) * 100}%` }}
                      className="bg-emerald-500 h-full transition-all"
                    />
                    <div
                      style={{ width: `${(analysis.matchedCount / analysis.totalRows) * 100}%` }}
                      className="bg-amber-400 h-full transition-all"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-hairline">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSummaryModal(false)}
              >
                Review Details in Table
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setShowSummaryModal(false);
                  handleCommit();
                }}
                disabled={isCommitting || analysis.newCount === 0}
              >
                {isCommitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Committing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Commit {analysis.newCount} New Records
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
