import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import {
  updateTimelineEvent,
  deleteTimelineEvent,
  addTimelineEventMedia,
  deleteTimelineEventMedia,
} from "../actions";
import { TimelineEventFormFields } from "../timeline-event-form";
import { TimelineMediaGallery } from "../timeline-media-gallery";

export default async function EditTimelineEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const event = await prisma.timelineEvent.findUnique({
    where: { id },
    include: { media: { orderBy: { createdAt: "asc" } } },
  });
  if (!event) notFound();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-[26px]">Edit milestone</h1>

      <form
        action={updateTimelineEvent}
        className="flex max-w-lg flex-col gap-4"
      >
        <input type="hidden" name="id" value={event.id} />
        <TimelineEventFormFields
          defaultValues={{
            title: event.title,
            description: event.description,
            order: event.order,
            eventDate: event.eventDate,
          }}
        />
        <Button type="submit" variant="primary" className="mt-2 self-start">
          Save changes
        </Button>
      </form>

      <section>
        <h2 className="mb-3 text-lg font-medium text-ink">Media</h2>
        <TimelineMediaGallery
          timelineEventId={event.id}
          media={event.media}
          addAction={addTimelineEventMedia}
          deleteAction={deleteTimelineEventMedia}
        />
      </section>

      <form action={deleteTimelineEvent}>
        <input type="hidden" name="id" value={event.id} />
        <Button type="submit" variant="danger">
          Delete event
        </Button>
      </form>
    </div>
  );
}
