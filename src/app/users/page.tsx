import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { maskContactNumber, maskName } from "@/lib/mask";
import { PublicShell } from "@/components/public-shell";
import { UNIT_TYPE_LABELS, type UnitType } from "@/lib/user-enums";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ building?: string; q?: string }>;
}) {
  const { building: buildingFilter, q } = await searchParams;
  const activeBuilding = buildingFilter && buildingFilter !== "all" ? buildingFilter : "all";

  const [documents, buildings] = await Promise.all([
    prisma.ownershipDocument.findMany({
      where: {
        ...(activeBuilding !== "all" ? { user: { buildingId: activeBuilding } } : {}),
        ...(q
          ? {
              OR: [
                { user: { name: { contains: q, mode: "insensitive" } } },
                { unitNumber: { contains: q, mode: "insensitive" } },
                { accountNumber: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        user: { include: { building: true } },
        photos: true,
      },
      orderBy: [
        { user: { building: { name: "asc" } } },
        { user: { name: "asc" } },
        { createdAt: "asc" },
      ],
    }),
    prisma.building.findMany({ orderBy: { name: "asc" } }),
  ]);

  const groups: { key: string; name: string; documents: typeof documents }[] = [];
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

  function buildingHref(buildingId: string | "all") {
    const params = new URLSearchParams();
    if (buildingId !== "all") params.set("building", buildingId);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/users?${qs}` : "/users";
  }

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

        <form className="mb-4 flex flex-wrap gap-2" method="GET">
          {activeBuilding !== "all" && (
            <input type="hidden" name="building" value={activeBuilding} />
          )}
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

        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={buildingHref("all")}
            className={`rounded-full border border-accent px-4 py-1.5 text-sm font-medium ${
              activeBuilding === "all" ? "bg-ink text-white" : "bg-white text-ink"
            }`}
          >
            All
          </Link>
          {buildings.map((building) => (
            <Link
              key={building.id}
              href={buildingHref(building.id)}
              className={`rounded-full border border-accent px-4 py-1.5 text-sm font-medium ${
                activeBuilding === building.id ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              {building.name}
            </Link>
          ))}
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-muted">No units match.</p>
        ) : (
          groups.map((group) => (
            <div key={group.key} className="mb-8">
              <div className="mb-3.5 flex items-baseline gap-2.5 border-b border-hairline pb-2.5">
                <h2 className="font-sans text-[17px] font-medium text-ink">{group.name}</h2>
                <span className="font-mono text-xs text-muted">
                  {group.documents.length} unit{group.documents.length === 1 ? "" : "s"}
                </span>
              </div>

              {group.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-1 gap-4 border-b border-hairline-soft py-4 sm:grid-cols-[0.9fr_0.7fr_1fr_1.3fr_1.3fr_1.2fr]"
                >
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Name
                    </div>
                    <div className="font-mono text-sm text-ink">{maskName(doc.user.name)}</div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Unit
                    </div>
                    <div className="font-mono text-sm text-ink">{doc.unitNumber ?? "—"}</div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Contact
                    </div>
                    <div className="font-mono text-sm text-ink">
                      {maskContactNumber(doc.user.contactNumber)}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Unit type
                    </div>
                    <div className="font-mono text-sm text-ink">
                      {doc.unitType ? UNIT_TYPE_LABELS[doc.unitType as UnitType] : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      PPJB number
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-hairline bg-surface-soft px-2 py-0.5 font-mono text-xs text-ink">
                        {doc.accountNumber}
                      </span>
                      {doc.photos.slice(0, 2).map((photo) => (
                        <div
                          key={photo.id}
                          className="relative h-[18px] w-[18px] overflow-hidden rounded-sm border border-hairline"
                        >
                          <Image src={photo.url} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Remarks
                    </div>
                    <div className="text-[13px] text-muted">{doc.user.remarks || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </PublicShell>
  );
}
