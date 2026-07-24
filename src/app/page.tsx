import { prisma } from "@/lib/prisma";
import { getHomeContent } from "@/lib/home-content";
import { MarkdownContent } from "@/components/markdown-content";
import { PublicShell } from "@/components/public-shell";
import { Card } from "@/components/ui/card";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { TimelineMediaCarousel } from "@/components/timeline-media-carousel";

export const dynamic = "force-dynamic";

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatEventDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short" }).format(date);
}

export default async function HomePage() {
  const [homeContent, timelineEvents, mediaLinks] = await Promise.all([
    getHomeContent(),
    prisma.timelineEvent.findMany({
      orderBy: [{ order: "asc" }, { eventDate: "asc" }],
      include: { media: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.mediaLink.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <PublicShell>
      <div className="h-1.5 bg-accent" />
      <div className="bg-ink px-6 py-14 md:px-16">
        <div className="mx-auto max-w-[1120px]">
          <h1 className="mb-3.5 text-[40px] leading-[1.1] tracking-[-0.5px] text-white md:text-[52px]">
            LRT City Consumer Community
          </h1>
          <p className="max-w-[640px] text-[17px] leading-relaxed text-white/85">
            Perkumpulan konsumen LRT City yang menanti hak nya dipenuhi oleh PT
            ADCP selaku pengembang LRT City
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-6 py-14 md:px-16">
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="p-8">
            <SectionEyebrow className="mb-3">About</SectionEyebrow>
            <h2 className="mb-4 text-[26px]">{homeContent.aboutTitle}</h2>
            <MarkdownContent markdown={homeContent.aboutMarkdown} variant="editorial" />
          </Card>
          <Card className="p-8">
            <SectionEyebrow className="mb-3">How to join</SectionEyebrow>
            <h2 className="mb-4 text-[26px]">{homeContent.howToJoinTitle}</h2>
            <MarkdownContent markdown={homeContent.howToJoinMarkdown} variant="steps" />
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="mb-2 inline-block border-b-2 border-accent pb-1 text-[28px]">
            Timeline
          </h2>
          <p className="mb-8 font-mono text-sm text-muted">
            Dated milestones on the LRT City Tebet line.
          </p>
          {timelineEvents.length === 0 ? (
            <p className="text-sm text-muted">No events yet.</p>
          ) : (
            <div className="relative">
              <div className="absolute top-[13px] right-0 left-0 h-0.5 bg-accent" />
              <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
                {timelineEvents.map((event) => (
                  <div key={event.id} className="relative w-[260px] flex-none snap-start">
                    <div className="mb-3.5 flex items-center gap-2">
                      <div className="h-3 w-3 flex-none border-2 border-surface bg-ink shadow-[0_0_0_2px_var(--color-accent)]" />
                      {formatEventDate(event.eventDate) && (
                        <span className="font-mono text-xs font-medium text-accent-text">
                          {formatEventDate(event.eventDate)}
                        </span>
                      )}
                    </div>
                    <Card className="overflow-hidden">
                      <TimelineMediaCarousel media={event.media} title={event.title} />
                      <div className="p-4">
                        <h3 className="mb-2 text-[15px] font-medium text-ink">{event.title}</h3>
                        <p className="text-[13px] leading-relaxed text-muted">{event.description}</p>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-6 text-[28px]">In the media</h2>
          {mediaLinks.length === 0 ? (
            <p className="text-sm text-muted">No media coverage yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mediaLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
                  <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-accent/40">
                    <div className="relative h-[120px] w-full bg-gradient-to-br from-[#e8f2f1] to-[#d7e9e8]">
                      {link.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary external domains, cannot be whitelisted
                        <img src={link.imageUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2.5 p-[18px]">
                      <span className="inline-flex w-fit rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[11px] text-accent-text">
                        {hostname(link.url)}
                      </span>
                      <h3 className="text-[15px] leading-snug font-medium text-ink">
                        {link.title || link.url}
                      </h3>
                      {link.description && (
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">
                          {link.description}
                        </p>
                      )}
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
