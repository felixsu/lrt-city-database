"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveUploadSettings } from "./actions";

export function UploadSettingsForm({
  initialTimelineMaxUploadMb,
  initialPpjbMaxUploadMb,
}: {
  initialTimelineMaxUploadMb: number;
  initialPpjbMaxUploadMb: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await saveUploadSettings(formData);
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-ink">Timeline media max size (MB)</label>
        <input
          type="number"
          name="timelineMaxUploadMb"
          min={1}
          defaultValue={initialTimelineMaxUploadMb}
          className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">Applies to each photo or video on a Timeline event.</p>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">PPJB photo max size (MB)</label>
        <input
          type="number"
          name="ppjbMaxUploadMb"
          min={1}
          defaultValue={initialPpjbMaxUploadMb}
          className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">
          Applies to each unit&apos;s PPJB photo and SPPU image.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        {saved && !isPending && <span className="text-sm text-green-600">Saved</span>}
      </div>
    </form>
  );
}
