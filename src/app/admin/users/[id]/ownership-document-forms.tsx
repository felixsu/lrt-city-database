"use client";

import Image from "next/image";
import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UNIT_TYPES, UNIT_TYPE_LABELS } from "@/lib/user-enums";
import type { UserFormState } from "../actions";

type OwnershipDocumentAction = (
  prevState: UserFormState,
  formData: FormData,
) => Promise<UserFormState>;

type Photo = { id: string; url: string };

function toDateInputValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

const fieldInputClass =
  "mt-1 rounded-lg border border-hairline bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent";

function MissingBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 align-middle font-mono text-[10px] text-accent-strong">
      <TriangleAlert className="h-2.5 w-2.5" /> Missing
    </span>
  );
}

export function OwnershipDocumentCard({
  document,
  userId,
  updateAction,
  deleteAction,
  addPhotoAction,
  deletePhotoAction,
}: {
  document: {
    id: string;
    accountNumber: string | null;
    unitNumber: string | null;
    unitType: string | null;
    ppjbDate: Date | null;
    sppuNumber: string | null;
    sppuDate: Date | null;
    sppuImageUrl: string | null;
    purchasePrice?: string | null;
    paymentType?: string | null;
    loanBankName?: string | null;
    loanTenorMonths?: number | null;
    loanMonthsPaid?: number | null;
    loanPaymentStatus?: string | null;
    demandType?: string | null;
    materialLossPaid?: string | null;
    materialDetails?: string | null;
    remainingArrears?: string | null;
    otherLosses?: string | null;
    lossBasisCalc?: string | null;
    pinjamPakai?: string | null;
    maxWaitDuration?: string | null;
    compensation?: string | null;
    surveyTimestamp?: Date | null;
    photos: Photo[];
  };
  userId: string;
  updateAction: OwnershipDocumentAction;
  deleteAction: (formData: FormData) => void;
  addPhotoAction: OwnershipDocumentAction;
  deletePhotoAction: (formData: FormData) => void;
}) {
  const [updateState, updateFormAction, updatePending] = useActionState<UserFormState, FormData>(
    updateAction,
    { error: null },
  );
  const [photoState, photoFormAction, photoPending] = useActionState<UserFormState, FormData>(
    addPhotoAction,
    { error: null },
  );

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <form action={updateFormAction} encType="multipart/form-data" className="flex flex-col gap-3">
        <input type="hidden" name="id" value={document.id} />
        <input type="hidden" name="userId" value={userId} />

        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs font-medium text-muted">Unit number</label>
            <input
              type="text"
              name="unitNumber"
              required
              placeholder="05-18"
              pattern="\d{2}-\d{2}"
              maxLength={5}
              defaultValue={document.unitNumber ?? ""}
              className={`${fieldInputClass} w-28 font-mono`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Unit type</label>
            <select
              name="unitType"
              defaultValue={document.unitType ?? ""}
              className={`${fieldInputClass} w-32`}
            >
              <option value="">Unspecified</option>
              {UNIT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {UNIT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">
              PPJB number
              {!document.accountNumber && <MissingBadge />}
            </label>
            <input
              type="text"
              name="accountNumber"
              defaultValue={document.accountNumber ?? ""}
              placeholder="e.g. 005/ACP-TPM/PPJB/II/2024"
              className={`${fieldInputClass} w-64 font-mono`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">PPJB date</label>
            <input
              type="date"
              name="ppjbDate"
              defaultValue={toDateInputValue(document.ppjbDate)}
              className={fieldInputClass}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">
              SPPU number
              {!document.sppuNumber && <MissingBadge />}
            </label>
            <input
              type="text"
              name="sppuNumber"
              defaultValue={document.sppuNumber ?? ""}
              className={`${fieldInputClass} w-48 font-mono`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">SPPU date</label>
            <input
              type="date"
              name="sppuDate"
              defaultValue={toDateInputValue(document.sppuDate)}
              className={fieldInputClass}
            />
          </div>
        </div>

        {/* Survey & Integrated Financial Details */}
        {(document.purchasePrice ||
          document.paymentType ||
          document.demandType ||
          document.materialLossPaid ||
          document.remainingArrears ||
          document.materialDetails) && (
          <div className="rounded-lg border border-hairline bg-surface-soft/40 p-3 text-xs space-y-2.5">
            <span className="font-semibold text-ink block border-b border-hairline pb-1">
              Survey & Financial Details (Imported from Consumer Survey)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-muted block text-[11px]">Purchase Price</span>
                <span className="font-medium text-ink">{document.purchasePrice || "—"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Payment Method</span>
                <span className="text-ink">{document.paymentType || "—"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Loan Bank</span>
                <span className="text-ink">{document.loanBankName || "—"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Tenor / Months Paid</span>
                <span className="text-ink">
                  {document.loanTenorMonths ? `${document.loanTenorMonths} bln` : "—"} /{" "}
                  {document.loanMonthsPaid ? `${document.loanMonthsPaid} paid` : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">KPA Status</span>
                <span className="text-ink">{document.loanPaymentStatus || "—"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Demand Type</span>
                <span className="font-semibold text-accent">{document.demandType || "—"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Material Loss Paid</span>
                <span className="font-medium text-red-600">{document.materialLossPaid || "—"}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Remaining Arrears</span>
                <span className="text-ink">{document.remainingArrears || "—"}</span>
              </div>
            </div>

            {document.materialDetails && (
              <div className="border-t border-hairline pt-2">
                <span className="text-muted block text-[11px]">Material Loss Details:</span>
                <p className="mt-0.5 whitespace-pre-wrap font-mono text-[11px] text-ink bg-surface p-2 rounded border border-hairline">
                  {document.materialDetails}
                </p>
              </div>
            )}

            {document.lossBasisCalc && (
              <div className="border-t border-hairline pt-2">
                <span className="text-muted block text-[11px]">Immaterial Loss Calculation:</span>
                <p className="mt-0.5 whitespace-pre-wrap font-mono text-[11px] text-ink bg-surface p-2 rounded border border-hairline">
                  {document.lossBasisCalc}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {document.sppuImageUrl && (
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded-md bg-surface-soft">
              <Image src={document.sppuImageUrl} alt="SPPU" fill className="object-cover" />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted">
              SPPU image {document.sppuImageUrl ? "(upload to replace)" : ""}
            </label>
            <input type="file" name="sppuImage" accept="image/*" className="mt-1 block text-xs" />
          </div>
          <Button type="submit" variant="primary" size="sm" disabled={updatePending}>
            {updatePending ? "Saving..." : "Save"}
          </Button>
        </div>
        {updateState.error && <p className="text-xs text-red-600">{updateState.error}</p>}
      </form>

      <form action={deleteAction} className="mt-2">
        <input type="hidden" name="id" value={document.id} />
        <input type="hidden" name="userId" value={userId} />
        <Button type="submit" variant="danger" size="sm">
          Delete unit
        </Button>
      </form>

      {document.photos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {document.photos.map((photo) => (
            <div key={photo.id} className="flex flex-col items-center gap-1">
              <div className="relative h-20 w-20 overflow-hidden rounded-md bg-surface-soft">
                <Image src={photo.url} alt="Unit" fill className="object-cover" />
              </div>
              <form action={deletePhotoAction}>
                <input type="hidden" name="id" value={photo.id} />
                <input type="hidden" name="userId" value={userId} />
                <button type="submit" className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form
        action={photoFormAction}
        encType="multipart/form-data"
        className="mt-3 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2">
          <input type="hidden" name="ownershipDocumentId" value={document.id} />
          <input type="hidden" name="userId" value={userId} />
          <input type="file" name="photo" accept="image/*" required className="text-xs" />
          <Button type="submit" size="sm" disabled={photoPending}>
            {photoPending ? "Uploading..." : "Add photo"}
          </Button>
        </div>
        {photoState.error && <p className="text-xs text-red-600">{photoState.error}</p>}
      </form>
    </div>
  );
}

export function CreateOwnershipDocumentForm({
  action,
  userId,
}: {
  action: OwnershipDocumentAction;
  userId: string;
}) {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(action, {
    error: null,
  });

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex flex-col gap-3 rounded-xl border border-dashed border-hairline p-4"
    >
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-sm font-medium text-ink">Unit number</label>
          <input
            type="text"
            name="unitNumber"
            required
            placeholder="05-18"
            pattern="\d{2}-\d{2}"
            maxLength={5}
            className="mt-1 w-28 rounded-lg border border-hairline bg-surface px-3 py-2 font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Unit type</label>
          <select
            name="unitType"
            defaultValue=""
            className="mt-1 w-32 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm"
          >
            <option value="">Unspecified</option>
            {UNIT_TYPES.map((type) => (
              <option key={type} value={type}>
                {UNIT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink">PPJB number (optional)</label>
          <input
            type="text"
            name="accountNumber"
            placeholder="e.g. 005/ACP-TPM/PPJB/II/2024"
            className="mt-1 w-64 rounded-lg border border-hairline bg-surface px-3 py-2 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-muted">
            Format: sequence/developer-code/PPJB/month-roman/year.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-ink">PPJB date</label>
          <input
            type="date"
            name="ppjbDate"
            className="mt-1 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">SPPU number</label>
          <input
            type="text"
            name="sppuNumber"
            className="mt-1 w-48 rounded-lg border border-hairline bg-surface px-3 py-2 font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">SPPU date</label>
          <input
            type="date"
            name="sppuDate"
            className="mt-1 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-sm font-medium text-ink">SPPU image (optional)</label>
          <input type="file" name="sppuImage" accept="image/*" className="mt-1 block text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Photo (optional)</label>
          <input type="file" name="photo" accept="image/*" className="mt-1 block text-sm" />
        </div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Adding..." : "Add unit"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
