"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { UserFormFields } from "./user-form-fields";
import type { UserFormState } from "./actions";

type Building = { id: string; name: string };
type LoanBank = { id: string; name: string };

export function UserForm({
  action,
  buildings,
  loanBanks,
  defaultValues,
  hiddenId,
  submitLabel,
}: {
  action: (prevState: UserFormState, formData: FormData) => Promise<UserFormState>;
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
  hiddenId?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(action, {
    error: null,
  });

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {hiddenId && <input type="hidden" name="id" value={hiddenId} />}
      <UserFormFields buildings={buildings} loanBanks={loanBanks} defaultValues={defaultValues} />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" variant="primary" disabled={pending} className="mt-2 self-start">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
