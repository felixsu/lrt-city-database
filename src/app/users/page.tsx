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
  searchParams: Promise<{ building?: string }>;
}) {
  const { building: buildingFilter } = await searchParams;
  const activeBuilding = buildingFilter && buildingFilter !== "all" ? buildingFilter : "all";

  const [users, buildings] = await Promise.all([
    prisma.user.findMany({
      where: activeBuilding !== "all" ? { buildingId: activeBuilding } : undefined,
      include: {
        building: true,
        ownershipDocuments: { include: { photos: true }, orderBy: { createdAt: "asc" } },
      },
      orderBy: [{ building: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.building.findMany({ orderBy: { name: "asc" } }),
  ]);

  const groups: { key: string; name: string; residents: typeof users }[] = [];
  for (const user of users) {
    const key = user.buildingId ?? "unassigned";
    const name = user.building?.name ?? "Unassigned";
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, name, residents: [] };
      groups.push(group);
    }
    group.residents.push(user);
  }

  return (
    <PublicShell>
      <div className="h-1.5 bg-accent" />
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:px-16">
        <div className="mb-1.5 flex flex-wrap items-center gap-3">
          <h1 className="text-[32px]">Resident directory</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-soft px-2.5 py-1 font-mono text-[11px] text-muted">
            <Lock className="h-3 w-3" /> masked for privacy
          </span>
        </div>
        <p className="mb-7 text-sm text-muted">
          Spot-check that a name or unit is genuinely on record. Private details
          stay redacted here.
        </p>

        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/users"
            className={`rounded-full border border-accent px-4 py-1.5 text-sm font-medium ${
              activeBuilding === "all" ? "bg-ink text-white" : "bg-white text-ink"
            }`}
          >
            All
          </Link>
          {buildings.map((building) => (
            <Link
              key={building.id}
              href={`/users?building=${building.id}`}
              className={`rounded-full border border-accent px-4 py-1.5 text-sm font-medium ${
                activeBuilding === building.id ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              {building.name}
            </Link>
          ))}
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-muted">No users yet.</p>
        ) : (
          groups.map((group) => (
            <div key={group.key} className="mb-8">
              <div className="mb-3.5 flex items-baseline gap-2.5 border-b border-hairline pb-2.5">
                <h2 className="font-sans text-[17px] font-medium text-ink">{group.name}</h2>
                <span className="font-mono text-xs text-muted">
                  {group.residents.length} resident{group.residents.length === 1 ? "" : "s"}
                </span>
              </div>

              {group.residents.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 gap-4 border-b border-hairline-soft py-4 sm:grid-cols-[0.9fr_0.7fr_1fr_1.3fr_1.3fr_1.2fr]"
                >
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Name
                    </div>
                    <div className="font-mono text-sm text-ink">{maskName(user.name)}</div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Unit
                    </div>
                    <div className="font-mono text-sm text-ink">{user.unitNumber ?? "—"}</div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Contact
                    </div>
                    <div className="font-mono text-sm text-ink">
                      {maskContactNumber(user.contactNumber)}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Unit type
                    </div>
                    <div className="font-mono text-sm text-ink">
                      {user.unitType ? UNIT_TYPE_LABELS[user.unitType as UnitType] : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Ownership documents
                    </div>
                    {user.ownershipDocuments.length === 0 ? (
                      <div className="text-sm text-muted">—</div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {user.ownershipDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2">
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
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
                      Remarks
                    </div>
                    <div className="text-[13px] text-muted">{user.remarks || "—"}</div>
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
