import { requireAdmin } from "@/lib/require-admin";
import { createTimelineEvent } from "../actions";
import { TimelineEventFormFields } from "../timeline-event-form";

export default async function NewTimelineEventPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add Timeline Event</h1>

      <form action={createTimelineEvent} encType="multipart/form-data" className="flex max-w-lg flex-col gap-4">
        <TimelineEventFormFields />
        <button
          type="submit"
          className="mt-2 self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Create event
        </button>
      </form>
    </div>
  );
}
