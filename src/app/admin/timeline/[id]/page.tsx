import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
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
      <h1 className="text-[26px]">Edit milestone</h1>

      <form
        action={updateTimelineEvent}
        encType="multipart/form-data"
        className="flex max-w-lg flex-col gap-4"
      >
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
        <Button type="submit" variant="primary" className="mt-2 self-start">
          Save changes
        </Button>
      </form>

      <form action={deleteTimelineEvent}>
        <input type="hidden" name="id" value={event.id} />
        <Button type="submit" variant="danger">
          Delete event
        </Button>
      </form>
    </div>
  );
}
