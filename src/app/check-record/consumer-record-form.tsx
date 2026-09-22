"use client";

import { useActionState } from "react";
import { findConsumerRecord, type ConsumerLookupState } from "./actions";

const initialState: ConsumerLookupState = { error: null };
const inputClass = "mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export function ConsumerRecordForm() {
  const [state, formAction, pending] = useActionState(findConsumerRecord, initialState);

  return (
    <div className="max-w-2xl">
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

      {state.records && (
        <section className="mt-8" aria-live="polite">
          <h2 className="text-xl font-medium text-ink">Record found for {state.name}</h2>
          <p className="mt-1 text-sm text-muted">Document numbers remain masked for privacy.</p>
          <div className="mt-4 space-y-4">
            {state.records.map((record, index) => (
              <article key={`${record.project}-${record.unit}-${index}`} className="rounded-xl border border-hairline bg-surface p-5">
                <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                  <Detail label="Project location" value={record.project} />
                  <Detail label="Unit" value={record.unit} />
                  <Detail label="Decision / Tuntutan" value={record.demand} />
                  <Detail label="KPA payment status" value={record.paymentStatus} />
                  <Detail label="PPJB / SSKK" value={record.ppjb} />
                  <Detail label="SPPU" value={record.sppu} />
                </dl>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-mono text-[11px] tracking-[0.5px] text-muted uppercase">{label}</dt><dd className="mt-1 text-ink">{value}</dd></div>;
}
