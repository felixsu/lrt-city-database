import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { createTimelineEvent } from "../actions";
import { TimelineEventFormFields } from "../timeline-event-form";

export default async function NewTimelineEventPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[26px]">Add milestone</h1>

      <form
        action={createTimelineEvent}
        encType="multipart/form-data"
        className="flex max-w-lg flex-col gap-4"
      >
        <TimelineEventFormFields />
        <Button type="submit" variant="primary" className="mt-2 self-start">
          Create event
        </Button>
      </form>
    </div>
  );
}
