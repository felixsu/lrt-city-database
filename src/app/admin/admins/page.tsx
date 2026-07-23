import { X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { RolePill } from "@/components/ui/pill";
import { promoteAdmin, removeAdmin } from "./actions";

export default async function AdminAdminsPage() {
  const session = await requireAdmin();
  const admins = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px]">Admins</h1>
          <p className="mt-1 text-sm text-muted">
            Admin accounts sign in with Google. Add an email to grant admin access.
          </p>
        </div>
        <form action={promoteAdmin} className="flex gap-2">
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            required
            className="w-56 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" variant="primary">
            Grant access
          </Button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-soft text-xs font-medium text-muted">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Promoted by</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {admins.map((admin) => {
              const isSelf = admin.email === session.user?.email?.toLowerCase();
              return (
                <tr key={admin.id}>
                  <td className="px-4 py-3.5 font-mono text-xs text-ink">
                    {admin.email} {isSelf && <span className="text-muted">(you)</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <RolePill role={admin.role} />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-muted">
                    {admin.promotedBy || "— (bootstrap)"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {!isSelf && admins.length > 1 && (
                      <form action={removeAdmin}>
                        <input type="hidden" name="id" value={admin.id} />
                        <button type="submit" className="text-muted hover:text-red-600" aria-label="Remove admin">
                          <X className="h-4 w-4" />
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
