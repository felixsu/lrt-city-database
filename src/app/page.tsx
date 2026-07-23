import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getHomeContent } from "@/lib/home-content";
import { MarkdownContent } from "@/components/markdown-content";

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function HomePage() {
  const [homeContent, timelineEvents, mediaLinks] = await Promise.all([
    getHomeContent(),
    prisma.timelineEvent.findMany({
      orderBy: [{ order: "asc" }, { eventDate: "asc" }],
    }),
    prisma.mediaLink.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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

      <section>
        <h2 className="text-lg font-semibold">Media</h2>
        {mediaLinks.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">No media coverage yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mediaLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
              >
                <div className="relative h-40 w-full bg-neutral-100 dark:bg-neutral-900">
                  {link.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary external domains, cannot be whitelisted
                    <img
                      src={link.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                      No preview available
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {hostname(link.url)}
                  </p>
                  <p className="text-sm font-semibold">
                    {link.title || link.url}
                  </p>
                  {link.description && (
                    <p className="line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {link.description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
