import { requireAdmin } from "@/lib/require-admin";
import { createTimelineEvent } from "../actions";
import { CreateTimelineEventForm } from "../create-timeline-event-form";

export default async function NewTimelineEventPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[26px]">Add milestone</h1>
      <CreateTimelineEventForm action={createTimelineEvent} />
    </div>
  );
}
