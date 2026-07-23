"use client";

import { useState } from "react";
import { UNIT_TYPES, UNIT_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/user-enums";

type Building = { id: string; name: string };
type LoanBank = { id: string; name: string };

function toDateInputValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

const inputClass =
  "mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export function UserFormFields({
  buildings,
  loanBanks,
  defaultValues,
}: {
  buildings: Building[];
  loanBanks: LoanBank[];
  defaultValues?: {
    name: string;
    unitNumber: string | null;
    unitType: string | null;
    contactNumber: string;
    buildingId: string | null;
    loanBankId: string | null;
    paymentStatus: "IN_PROGRESS" | "PAID_OFF";
    paidOffDate: Date | null;
    remarks: string | null;
  };
}) {
  const [paymentStatus, setPaymentStatus] = useState(defaultValues?.paymentStatus ?? "IN_PROGRESS");

  return (
    <>
      <div>
        <label className="text-sm font-medium text-ink">Name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={defaultValues?.name}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Unit number</label>
        <input
          type="text"
          name="unitNumber"
          required
          placeholder="05-18"
          pattern="\d{2}-\d{2}"
          maxLength={5}
          defaultValue={defaultValues?.unitNumber ?? ""}
          className={`${inputClass} font-mono`}
        />
        <p className="mt-1 text-xs text-muted">
          2-digit floor, dash, 2-digit room — e.g. 05-18.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Unit type</label>
        <select name="unitType" defaultValue={defaultValues?.unitType ?? ""} className={inputClass}>
          <option value="">Unspecified</option>
          {UNIT_TYPES.map((type) => (
            <option key={type} value={type}>
              {UNIT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Contact number</label>
        <input
          type="text"
          name="contactNumber"
          required
          defaultValue={defaultValues?.contactNumber}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">LRT City building</label>
        <select
          name="buildingId"
          defaultValue={defaultValues?.buildingId ?? ""}
          className={inputClass}
        >
          <option value="">Unassigned</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Loan bank</label>
        <select
          name="loanBankId"
          defaultValue={defaultValues?.loanBankId ?? ""}
          className={inputClass}
        >
          <option value="">None / cash purchase</option>
          {loanBanks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium text-ink">Payment status</label>
          <select
            name="paymentStatus"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as "IN_PROGRESS" | "PAID_OFF")}
            className={inputClass}
          >
            {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {paymentStatus === "PAID_OFF" && (
          <div>
            <label className="text-sm font-medium text-ink">Paid off date</label>
            <input
              type="date"
              name="paidOffDate"
              defaultValue={toDateInputValue(defaultValues?.paidOffDate)}
              className={inputClass}
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-ink">
          Remarks{" "}
          <span className="font-normal text-muted">
            (e.g. reason PPJB could not be provided)
          </span>
        </label>
        <textarea
          name="remarks"
          rows={3}
          defaultValue={defaultValues?.remarks ?? ""}
          className={inputClass}
        />
      </div>
    </>
  );
}
