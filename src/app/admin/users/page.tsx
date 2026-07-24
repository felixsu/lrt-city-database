import { Plus, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { LinkButton } from "@/components/ui/button";
import { PAYMENT_STATUS_LABELS } from "@/lib/user-enums";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    date,
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; building?: string }>;
}) {
  await requireAdmin();
  const { q, building } = await searchParams;

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
        _count: { select: { ownershipDocuments: true } },
        ownershipDocuments: { select: { accountNumber: true, sppuNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.building.findMany({ orderBy: { name: "asc" } }),
  ]);

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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Building</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Loan bank</th>
              <th className="px-4 py-3">Payment status</th>
              <th className="px-4 py-3">Units</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted">
                  No users match.
                </td>
              </tr>
            ) : (
              users.map((user) => (
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
                  <td className="px-4 py-3.5 font-mono text-xs text-ink">
                    <span className="inline-flex items-center gap-1">
                      {user._count.ownershipDocuments}
                      {user.ownershipDocuments.some((d) => !d.accountNumber || !d.sppuNumber) && (
                        <TriangleAlert
                          className="h-3 w-3 text-accent-strong"
                          aria-label="Missing PPJB or SPPU number"
                        />
                      )}
                    </span>
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
