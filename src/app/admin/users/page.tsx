import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { LinkButton } from "@/components/ui/button";
import { PAYMENT_STATUS_LABELS } from "@/lib/user-enums";

type SortColumn = "name" | "contact" | "unit";
type SortDir = "asc" | "desc";

const SORT_COLUMNS: readonly SortColumn[] = ["name", "contact", "unit"];

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    date,
  );
}

function compareValues(a: string | null, b: string | null, dir: SortDir) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  const result = a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  return dir === "asc" ? result : -result;
}

function SortableHeader({
  label,
  href,
  active,
  dir,
}: {
  label: string;
  href: string;
  active: boolean;
  dir: SortDir;
}) {
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 hover:text-ink ${active ? "text-ink" : ""}`}
    >
      {label}
      <Icon className="h-3 w-3" />
    </Link>
  );
}

function MissingChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent-strong">
      <TriangleAlert className="h-2.5 w-2.5" /> {label}
    </span>
  );
}

function ValuePill({ value }: { value: string }) {
  return (
    <span className="rounded-md border border-hairline bg-surface-soft px-2 py-0.5 font-mono text-xs text-ink">
      {value}
    </span>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; building?: string; sort?: string; dir?: string }>;
}) {
  await requireAdmin();
  const { q, building, sort, dir } = await searchParams;
  const sortColumn = SORT_COLUMNS.find((column) => column === sort) ?? null;
  const sortDir: SortDir = dir === "desc" ? "desc" : "asc";

  const [users, buildings] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...(building && building !== "all" ? { buildingId: building } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { contactNumber: { contains: q, mode: "insensitive" } },
                {
                  ownershipDocuments: {
                    some: { unitNumber: { contains: q, mode: "insensitive" } },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        building: true,
        loanBank: true,
        ownershipDocuments: {
          select: { id: true, unitNumber: true, accountNumber: true, sppuNumber: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.building.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows = users.map((user) => ({
    ...user,
    ownershipDocuments: [...user.ownershipDocuments].sort((a, b) =>
      compareValues(a.unitNumber, b.unitNumber, "asc"),
    ),
  }));

  if (sortColumn) {
    rows.sort((a, b) => {
      if (sortColumn === "name") return compareValues(a.name, b.name, sortDir);
      if (sortColumn === "contact") return compareValues(a.contactNumber, b.contactNumber, sortDir);
      const aUnit = a.ownershipDocuments.find((doc) => doc.unitNumber !== null)?.unitNumber ?? null;
      const bUnit = b.ownershipDocuments.find((doc) => doc.unitNumber !== null)?.unitNumber ?? null;
      return compareValues(aUnit, bUnit, sortDir);
    });
  }

  function sortHref(column: SortColumn) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (building) params.set("building", building);
    params.set("sort", column);
    params.set("dir", sortColumn === column && sortDir === "asc" ? "desc" : "asc");
    return `/admin/users?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px]">Consumers</h1>
          <p className="mt-1 text-sm text-muted">
            Manage customer records, unit ownership, and photos.
          </p>
        </div>
        <LinkButton href="/admin/users/new" variant="primary">
          <Plus className="h-4 w-4" /> Add consumer
        </LinkButton>
      </div>

      <form className="flex flex-wrap gap-2.5" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name, contact, or unit…"
          className="h-[38px] w-64 rounded-lg border border-hairline bg-surface px-3.5 text-sm outline-none focus:border-accent"
        />
        <select
          name="building"
          defaultValue={building ?? "all"}
          className="h-[38px] rounded-lg border border-hairline bg-surface px-3 text-sm"
        >
          <option value="all">All buildings</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        {sortColumn && <input type="hidden" name="sort" value={sortColumn} />}
        {sortColumn && <input type="hidden" name="dir" value={sortDir} />}
        <button
          type="submit"
          className="h-[38px] rounded-lg border border-hairline bg-surface px-4 text-sm hover:bg-surface-soft"
        >
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-soft text-xs font-medium text-muted">
            <tr>
              <th className="px-4 py-3">
                <SortableHeader
                  label="Name"
                  href={sortHref("name")}
                  active={sortColumn === "name"}
                  dir={sortDir}
                />
              </th>
              <th className="px-4 py-3">Building</th>
              <th className="px-4 py-3">
                <SortableHeader
                  label="Contact"
                  href={sortHref("contact")}
                  active={sortColumn === "contact"}
                  dir={sortDir}
                />
              </th>
              <th className="px-4 py-3">Loan bank</th>
              <th className="px-4 py-3">Payment status</th>
              <th className="px-4 py-3">
                <SortableHeader
                  label="Unit"
                  href={sortHref("unit")}
                  active={sortColumn === "unit"}
                  dir={sortDir}
                />
              </th>
              <th className="px-4 py-3">PPJB No</th>
              <th className="px-4 py-3">SPPU No</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-muted">
                  No users match.
                </td>
              </tr>
            ) : (
              rows.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3.5 font-medium text-ink">{user.name}</td>
                  <td className="px-4 py-3.5 text-ink">{user.building?.name ?? "—"}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-ink">{user.contactNumber}</td>
                  <td className="px-4 py-3.5 text-ink">{user.loanBank?.name ?? "—"}</td>
                  <td className="px-4 py-3.5 text-ink">
                    {PAYMENT_STATUS_LABELS[user.paymentStatus]}
                    {user.paymentStatus === "PAID_OFF" && user.paidOffDate && (
                      <span className="ml-1 font-mono text-xs text-muted">
                        ({formatDate(user.paidOffDate)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {user.ownershipDocuments.length === 0 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1">
                        {user.ownershipDocuments.map((doc) => (
                          <ValuePill key={doc.id} value={doc.unitNumber ?? "—"} />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {user.ownershipDocuments.length === 0 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1">
                        {user.ownershipDocuments.map((doc) =>
                          doc.accountNumber ? (
                            <ValuePill key={doc.id} value={doc.accountNumber} />
                          ) : (
                            <MissingChip key={doc.id} label="No PPJB" />
                          ),
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {user.ownershipDocuments.length === 0 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1">
                        {user.ownershipDocuments.map((doc) =>
                          doc.sppuNumber ? (
                            <ValuePill key={doc.id} value={doc.sppuNumber} />
                          ) : (
                            <MissingChip key={doc.id} label="No SPPU" />
                          ),
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <a
                      href={`/admin/users/${user.id}`}
                      className="rounded-lg border border-hairline px-3 py-1.5 text-xs hover:bg-surface-soft"
                    >
                      Manage
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
