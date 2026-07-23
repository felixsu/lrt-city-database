"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { UserFormFields } from "./user-form-fields";
import type { UserFormState } from "./actions";

type Building = { id: string; name: string };

export function UserForm({
  action,
  buildings,
  defaultValues,
  hiddenId,
  submitLabel,
}: {
  action: (prevState: UserFormState, formData: FormData) => Promise<UserFormState>;
  buildings: Building[];
  defaultValues?: {
    name: string;
    unitNumber: string | null;
    contactNumber: string;
    buildingId: string | null;
    remarks: string | null;
    buyDate: Date | null;
    joinDate: Date | null;
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
      <UserFormFields buildings={buildings} defaultValues={defaultValues} />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" variant="primary" disabled={pending} className="mt-2 self-start">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
