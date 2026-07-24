import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/public-shell";
import { Card } from "@/components/ui/card";
import { MarkdownContent } from "@/components/markdown-content";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <PublicShell>
      <div className="h-1.5 bg-accent" />
      <div className="mx-auto max-w-[1320px] px-6 py-12 md:px-16">
        <h1 className="mb-1.5 text-[32px]">Resources</h1>
        <p className="mb-7 text-sm text-muted">
          Guides, references, and other resources the community has gathered.
        </p>

        {resources.length === 0 ? (
          <p className="text-sm text-muted">No resources yet.</p>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {resources.map((resource) => (
              <Card
                key={resource.id}
                className="mb-6 break-inside-avoid overflow-hidden"
              >
                {resource.imageUrl && (
                  <Image
                    src={resource.imageUrl}
                    alt=""
                    width={resource.imageWidth ?? 800}
                    height={resource.imageHeight ?? 600}
                    className="h-auto w-full"
                  />
                )}
                <div className="flex flex-col gap-2.5 p-[18px]">
                  <h3 className="text-[15px] leading-snug font-medium text-ink">
                    {resource.title}
                  </h3>
                  <MarkdownContent markdown={resource.description} variant="compact" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
