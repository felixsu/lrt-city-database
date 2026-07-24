import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { LEAD_STATUS_LABELS } from "@/lib/user-enums";
import { LeadRow } from "./lead-row";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    date,
  );
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const activeStatus = status === "CONVERTED" ? "CONVERTED" : status === "NEW" ? "NEW" : "all";

  const leads = await prisma.lead.findMany({
    where: activeStatus !== "all" ? { status: activeStatus } : undefined,
    include: { building: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px]">Leads</h1>
        <p className="mt-1 text-sm text-muted">
          Public registration submissions. Convert a lead into a consumer record, or delete
          spam/invalid entries.
        </p>
      </div>

      <form className="flex flex-wrap gap-2.5" method="GET">
        <select
          name="status"
          defaultValue={activeStatus}
          className="h-[38px] rounded-lg border border-hairline bg-surface px-3 text-sm"
        >
          <option value="all">All statuses</option>
          {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
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
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Unit No</th>
              <th className="px-4 py-3">PPJB No</th>
              <th className="px-4 py-3">SPPU No</th>
              <th className="px-4 py-3">Building</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-muted">
                  No leads match.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={{
                    id: lead.id,
                    fullName: lead.fullName,
                    contactNumber: lead.contactNumber,
                    unitNumber: lead.unitNumber,
                    ppjbNumber: lead.ppjbNumber,
                    sppuNumber: lead.sppuNumber,
                    buildingName: lead.building?.name ?? "—",
                    status: lead.status,
                    createdAt: formatDate(lead.createdAt),
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
