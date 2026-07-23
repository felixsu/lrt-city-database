"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { TimelineEventFormFields } from "./timeline-event-form";
import type { TimelineMediaFormState } from "./actions";

export function CreateTimelineEventForm({
  action,
}: {
  action: (prevState: TimelineMediaFormState, formData: FormData) => Promise<TimelineMediaFormState>;
}) {
  const [state, formAction, pending] = useActionState<TimelineMediaFormState, FormData>(action, {
    error: null,
  });

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex max-w-lg flex-col gap-4"
    >
      <TimelineEventFormFields />

      <div>
        <label className="text-sm font-medium text-ink">Media (optional)</label>
        <input
          type="file"
          name="media"
          accept="image/*,video/*"
          multiple
          className="mt-1 block w-full text-sm"
        />
        <p className="mt-1 text-xs text-muted">Photos and videos, up to 10MB each.</p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" variant="primary" disabled={pending} className="mt-2 self-start">
        {pending ? "Creating..." : "Create event"}
      </Button>
    </form>
  );
}
