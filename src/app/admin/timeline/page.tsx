import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { LinkButton } from "@/components/ui/button";
import { ReorderableList } from "@/components/reorderable-list";
import { deleteTimelineEvent, reorderTimelineEvents } from "./actions";

function formatEventDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short" }).format(date);
}

export default async function AdminTimelinePage() {
  await requireAdmin();
  const events = await prisma.timelineEvent.findMany({
    orderBy: [{ order: "asc" }, { eventDate: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px]">Timeline</h1>
          <p className="mt-1 text-sm text-muted">
            Drag rows to reorder. This is the order shown on the public home page.
          </p>
        </div>
        <LinkButton href="/admin/timeline/new" variant="primary">
          <Plus className="h-4 w-4" /> Add milestone
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-hairline bg-surface p-2">
          {events.length === 0 ? (
            <p className="p-4 text-sm text-muted">No events yet.</p>
          ) : (
            <ReorderableList
              items={events.map((event) => ({
                id: event.id,
                content: (
                  <div className="flex items-center gap-3">
                    <span className="w-[70px] flex-none font-mono text-xs text-muted">
                      {formatEventDate(event.eventDate)}
                    </span>
                    <span className="flex-1 truncate text-sm text-ink">{event.title}</span>
                    <Link
                      href={`/admin/timeline/${event.id}`}
                      prefetch={false}
                      className="text-muted hover:text-ink"
                    >
                      <Pencil className="h-[15px] w-[15px]" />
                    </Link>
                    <form action={deleteTimelineEvent}>
                      <input type="hidden" name="id" value={event.id} />
                      <button type="submit" className="text-muted hover:text-red-600">
                        <Trash2 className="h-[15px] w-[15px]" />
                      </button>
                    </form>
                  </div>
                ),
              }))}
              reorderAction={reorderTimelineEvents}
            />
          )}
          <div className="p-2">
            <LinkButton href="/admin/timeline/new" variant="dashed" className="w-full">
              + Add milestone
            </LinkButton>
          </div>
        </div>

        <div className="rounded-xl border border-hairline bg-surface-soft p-5">
          <p className="mb-3.5 font-mono text-xs font-medium text-muted">Public preview</p>
          <div className="relative pl-[22px]">
            <div className="absolute top-1 bottom-1 left-1 w-0.5 bg-accent" />
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="relative pb-[18px]">
                <div className="absolute top-0.5 -left-[22px] h-[9px] w-[9px] bg-ink" />
                <span className="font-mono text-[11px] text-accent-text">
                  {formatEventDate(event.eventDate)}
                </span>
                <div className="text-sm text-ink">{event.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
