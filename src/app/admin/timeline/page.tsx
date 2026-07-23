import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { deleteTimelineEvent } from "./actions";

export default async function AdminTimelinePage() {
  await requireAdmin();
  const events = await prisma.timelineEvent.findMany({
    orderBy: [{ order: "asc" }, { eventDate: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage events shown on the public home page timeline.
          </p>
        </div>
        <Link
          href="/admin/timeline/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Add event
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {events.length === 0 ? (
          <p className="text-sm text-neutral-500">No events yet.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="flex items-center gap-4">
                {event.pictureUrl && (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
                    <Image src={event.pictureUrl} alt={event.title} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-neutral-500">
                    order {event.order}
                    {event.eventDate
                      ? ` · ${new Intl.DateTimeFormat("en-GB").format(event.eventDate)}`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/timeline/${event.id}`}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                >
                  Edit
                </Link>
                <form action={deleteTimelineEvent}>
                  <input type="hidden" name="id" value={event.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
