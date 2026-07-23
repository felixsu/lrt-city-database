import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { updateTimelineEvent, deleteTimelineEvent } from "../actions";
import { TimelineEventFormFields } from "../timeline-event-form";

export default async function EditTimelineEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const event = await prisma.timelineEvent.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Timeline Event</h1>

      <form action={updateTimelineEvent} encType="multipart/form-data" className="flex max-w-lg flex-col gap-4">
        <input type="hidden" name="id" value={event.id} />
        <TimelineEventFormFields
          defaultValues={{
            title: event.title,
            description: event.description,
            order: event.order,
            eventDate: event.eventDate,
            pictureUrl: event.pictureUrl,
          }}
        />
        <button
          type="submit"
          className="mt-2 self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Save changes
        </button>
      </form>

      <form action={deleteTimelineEvent}>
        <input type="hidden" name="id" value={event.id} />
        <button
          type="submit"
          className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          Delete event
        </button>
      </form>
    </div>
  );
}
