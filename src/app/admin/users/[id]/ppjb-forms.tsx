"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { UserFormState } from "../actions";

type PpjbAction = (prevState: UserFormState, formData: FormData) => Promise<UserFormState>;

export function AddPpjbPhotoForm({
  action,
  ppjbId,
  userId,
}: {
  action: PpjbAction;
  ppjbId: string;
  userId: string;
}) {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(action, {
    error: null,
  });

  return (
    <form action={formAction} encType="multipart/form-data" className="mt-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input type="hidden" name="ppjbId" value={ppjbId} />
        <input type="hidden" name="userId" value={userId} />
        <input type="file" name="photo" accept="image/*" required className="text-xs" />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Uploading..." : "Add photo"}
        </Button>
      </div>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

export function AddPpjbForm({ action, userId }: { action: PpjbAction; userId: string }) {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(action, {
    error: null,
  });

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex flex-col gap-3 rounded-xl border border-dashed border-hairline p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="userId" value={userId} />
        <div>
          <label className="text-sm font-medium text-ink">PPJB account number</label>
          <input
            type="text"
            name="accountNumber"
            required
            placeholder="e.g. 005/ACP-TPM/PPJB/II/2024"
            className="mt-1 w-72 rounded-lg border border-hairline bg-surface px-3 py-2 font-mono text-sm"
          />
          <p className="mt-1 text-xs text-muted">
            Format: sequence/developer-code/PPJB/month-roman/year.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Photo (optional)</label>
          <input type="file" name="photo" accept="image/*" className="mt-1 block text-sm" />
        </div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Adding..." : "Add PPJB"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
