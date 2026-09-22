"use client";

import { useActionState, useState } from "react";
import { findConsumerRecord, type ConsumerLookupRecord, type ConsumerLookupState } from "./actions";

const initialState: ConsumerLookupState = { error: null };
const inputClass = "mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export function ConsumerRecordForm() {
  const [state, formAction, pending] = useActionState(findConsumerRecord, initialState);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const records = state.records ?? [];
  const activeRecord = records.find((record) => record.id === activeUnitId) ?? records[0];

  return (
    <div className="max-w-4xl">
      <form action={formAction} className="grid gap-4 rounded-xl border border-hairline bg-surface p-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-ink">WhatsApp number</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-text disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? "Checking…" : "Check my record"}
          </button>
        </div>
      </form>

      {state.error && <p role="alert" className="mt-4 text-sm text-red-700">{state.error}</p>}

      {activeRecord && (
        <section className="mt-8" aria-live="polite">
          <h2 className="text-xl font-medium text-ink">Your recorded information</h2>
          <p className="mt-1 text-sm text-muted">The information below matches the email address and WhatsApp number you provided.</p>

          <div className="mt-5 rounded-xl border border-hairline bg-surface p-5">
            <h3 className="font-medium text-ink">Consumer information</h3>
            <dl className="mt-4 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
              <Detail label="Name" value={state.name ?? "—"} />
              <Detail label="Email" value={state.email ?? "—"} />
              <Detail label="WhatsApp number" value={state.phone ?? "—"} />
            </dl>
          </div>

          <div className="mt-6 border-b border-hairline">
            <div className="flex flex-wrap gap-2">
              {records.map((record) => (
                <button key={record.id} type="button" onClick={() => setActiveUnitId(record.id)} className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${record.id === activeRecord.id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}>
                  Unit {record.unit}
                </button>
              ))}
            </div>
          </div>

          <UnitDetails record={activeRecord} />
        </section>
      )}
    </div>
  );
}

function UnitDetails({ record }: { record: ConsumerLookupRecord }) {
  return (
    <div className="mt-6 space-y-5">
      <DetailsSection title="Unit and documents" details={[
        ["Project location", record.project], ["Unit", record.unit], ["PPJB / SSKK", record.ppjb], ["SPPU", record.sppu], ["Nilai Kontrak Unit", record.contractValue],
      ]} />
      <DetailsSection title="Payment" details={[
        ["Jenis Pembayaran", record.paymentType], ["Bank", record.bank], ["Tenor Pinjaman (bulan)", record.loanTenorMonths], ["Bulan pinjaman telah dibayarkan", record.loanMonthsPaid], ["Status Pembayaran KPA", record.paymentStatus],
      ]} />
      <DetailsSection title="Tuntutan and loss information" details={[
        ["Tuntutan", record.demand], ["Kerugian Materiil Sesuai yang SUDAH dibayarkan", record.materialLossPaid], ["Rincian Materiil", record.materialDetails], ["Sisa tunggakan yang masih harus dibayarkan", record.remainingArrears], ["Kerugian Materiil dan Imateriil Lainnya", record.otherLosses], ["Dasar Perhitungan Kerugian Immateriil", record.lossBasisCalc], ["Pinjam Pakai", record.pinjamPakai], ["Maksimal bersedia menunggu selama", record.maxWaitDuration], ["Kompensasi", record.compensation],
      ]} />
      <DetailsSection title="Submission" details={[["Form submitted", record.surveyTimestamp]]} />
    </div>
  );
}

function DetailsSection({ title, details }: { title: string; details: [string, string][] }) {
  return <section className="rounded-xl border border-hairline bg-surface p-5"><h3 className="font-medium text-ink">{title}</h3><dl className="mt-4 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">{details.map(([label, value]) => <Detail key={label} label={label} value={value} />)}</dl></section>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-mono text-[11px] tracking-[0.5px] text-muted uppercase">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-ink">{value}</dd></div>;
}
