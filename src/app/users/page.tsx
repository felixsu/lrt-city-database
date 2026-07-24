import { Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/public-shell";
import { ConsumerTabs, type ConsumerGroup } from "./consumer-tabs";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ building?: string; q?: string }>;
}) {
  const { building: buildingFilter, q } = await searchParams;

  const documents = await prisma.ownershipDocument.findMany({
    where: q
      ? {
          OR: [
            { user: { name: { contains: q, mode: "insensitive" } } },
            { unitNumber: { contains: q, mode: "insensitive" } },
            { accountNumber: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      user: { include: { building: true } },
      photos: true,
    },
    orderBy: [
      { user: { building: { name: "asc" } } },
      { user: { name: "asc" } },
      { createdAt: "asc" },
    ],
  });

  const groups: ConsumerGroup[] = [];
  for (const doc of documents) {
    const key = doc.user.buildingId ?? "unassigned";
    const name = doc.user.building?.name ?? "Unassigned";
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, name, documents: [] };
      groups.push(group);
    }
    group.documents.push(doc);
  }

  const defaultGroup = groups.reduce<ConsumerGroup | undefined>(
    (biggest, group) =>
      !biggest || group.documents.length > biggest.documents.length ? group : biggest,
    undefined,
  );
  const initialKey =
    (buildingFilter && groups.some((g) => g.key === buildingFilter) ? buildingFilter : undefined) ??
    defaultGroup?.key ??
    "";

  return (
    <PublicShell>
      <div className="h-1.5 bg-accent" />
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:px-16">
        <div className="mb-1.5 flex flex-wrap items-center gap-3">
          <h1 className="text-[32px]">Consumer Database</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-soft px-2.5 py-1 font-mono text-[11px] text-muted">
            <Lock className="h-3 w-3" /> masked for privacy
          </span>
        </div>
        <p className="mb-7 text-sm text-muted">
          Spot-check that a name or unit is genuinely on record. Private details
          stay redacted here.
        </p>

        <form className="mb-8 flex flex-wrap gap-2" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search name, unit, or PPJB number…"
            className="h-[38px] w-72 rounded-lg border border-hairline bg-surface px-3.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="h-[38px] rounded-lg border border-hairline bg-surface px-4 text-sm hover:bg-surface-soft"
          >
            Search
          </button>
        </form>

        {groups.length === 0 ? (
          <p className="text-sm text-muted">No units match.</p>
        ) : (
          <ConsumerTabs groups={groups} initialKey={initialKey} />
        )}
      </div>
    </PublicShell>
  );
}
