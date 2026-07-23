import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { promoteAdmin, removeAdmin } from "./actions";

export default async function AdminAdminsPage() {
  const session = await requireAdmin();
  const admins = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admins</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Admin accounts sign in with Google. Add an email to grant admin access.
        </p>
      </div>

      <form action={promoteAdmin} className="flex gap-3">
        <input
          type="email"
          name="email"
          placeholder="name@example.com"
          required
          className="w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Promote to admin
        </button>
      </form>

      <div className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {admins.map((admin) => {
          const isSelf = admin.email === session.user?.email?.toLowerCase();
          return (
            <div key={admin.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">
                  {admin.email} {isSelf && <span className="text-neutral-500">(you)</span>}
                </p>
                <p className="text-xs text-neutral-500">
                  {admin.role}
                  {admin.promotedBy ? ` · promoted by ${admin.promotedBy}` : ""}
                </p>
              </div>
              {!isSelf && admins.length > 1 && (
                <form action={removeAdmin}>
                  <input type="hidden" name="id" value={admin.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Remove
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
