"use client";

import { useActionState, useEffect, useState } from "react";
import Script from "next/script";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createLead, type LeadFormState } from "./registration-actions";

type Building = { id: string; name: string };

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

const inputClass =
  "mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export function RegistrationFabClient({ buildings }: { buildings: Building[] }) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function handleClose() {
    setOpen(false);
    setFormKey((k) => k + 1);
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Register as a consumer"
        className="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-colors hover:bg-accent-text"
      >
        <UserPlus className="h-6 w-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/60 p-6"
          onClick={handleClose}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-ink">Register</h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="text-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <RegistrationForm key={formKey} buildings={buildings} onDone={handleClose} />
          </div>
        </div>
      )}
    </>
  );
}

function RegistrationForm({
  buildings,
  onDone,
}: {
  buildings: Building[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<LeadFormState, FormData>(createLead, {
    error: null,
  });

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <p className="text-sm text-ink">
          Thanks — your registration has been received. Our team will follow up soon.
        </p>
        <Button type="button" onClick={onDone}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Script src="https://js.hcaptcha.com/1/api.js" strategy="afterInteractive" />

      <div>
        <label className="text-sm font-medium text-ink">Full Name</label>
        <input type="text" name="fullName" required className={inputClass} />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Contact (WhatsApp)</label>
        <input type="text" name="contactNumber" required className={inputClass} />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Unit No</label>
        <input
          type="text"
          name="unitNumber"
          required
          placeholder="05-18"
          pattern="\d{2}-\d{2}"
          maxLength={5}
          className={`${inputClass} font-mono`}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">PPJB No</label>
        <input type="text" name="ppjbNumber" required className={inputClass} />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">SPPU No</label>
        <input type="text" name="sppuNumber" required className={inputClass} />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Building</label>
        <select name="buildingId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select a building
          </option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      {/* Honeypot: invisible to real users, bots tend to fill every field they see in the DOM. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      />

      <div className="h-captcha" data-sitekey={HCAPTCHA_SITE_KEY} />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" variant="primary" disabled={pending} className="mt-2">
        {pending ? "Submitting..." : "Register"}
      </Button>
    </form>
  );
}
