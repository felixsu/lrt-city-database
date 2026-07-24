import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/public-shell";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <PublicShell>
      <div className="h-1.5 bg-accent" />
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:px-16">
        <h1 className="mb-1.5 text-[32px]">Resources</h1>
        <p className="mb-7 text-sm text-muted">
          Guides, references, and other resources the community has gathered.
        </p>

        {resources.length === 0 ? (
          <p className="text-sm text-muted">No resources yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <Card key={resource.id} className="flex h-full flex-col overflow-hidden">
                <div className="relative h-[120px] w-full bg-gradient-to-br from-[#e8f2f1] to-[#d7e9e8]">
                  {resource.imageUrl && (
                    <Image
                      src={resource.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-[18px]">
                  <h3 className="text-[15px] leading-snug font-medium text-ink">
                    {resource.title}
                  </h3>
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">
                    {resource.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
