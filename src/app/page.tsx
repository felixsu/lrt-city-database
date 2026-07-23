import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getHomeContent } from "@/lib/home-content";
import { MarkdownContent } from "@/components/markdown-content";

export default async function HomePage() {
  const [homeContent, timelineEvents] = await Promise.all([
    getHomeContent(),
    prisma.timelineEvent.findMany({
      orderBy: [{ order: "asc" }, { eventDate: "asc" }],
    }),
  ]);

  return (
    <div className="flex flex-col gap-16">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">
          LRT City Tebet Customer
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Official customer database and community information hub.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">About</h2>
        <div className="mt-3">
          <MarkdownContent markdown={homeContent.aboutMarkdown} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">How to Join</h2>
        <div className="mt-3">
          <MarkdownContent markdown={homeContent.howToJoinMarkdown} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Timeline</h2>
        {timelineEvents.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No events yet.</p>
        ) : (
          <ol className="mt-6 flex flex-col gap-8 border-l border-neutral-200 pl-6 dark:border-neutral-800">
            {timelineEvents.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-neutral-900 dark:bg-white" />
                {event.eventDate && (
                  <p className="text-xs font-medium text-neutral-500">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }).format(event.eventDate)}
                  </p>
                )}
                <h3 className="mt-1 text-base font-semibold">{event.title}</h3>
                {event.pictureUrl && (
                  <div className="relative mt-3 h-56 w-full max-w-md overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
                    <Image
                      src={event.pictureUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
                  {event.description}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
