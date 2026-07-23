import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { addBuilding, deleteBuilding } from "./actions";

export default async function AdminBuildingsPage() {
  await requireAdmin();
  const buildings = await prisma.building.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buildings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage the list of LRT City buildings available when assigning users.
        </p>
      </div>

      <form action={addBuilding} className="flex gap-3">
        <input
          type="text"
          name="name"
          placeholder="e.g. Tebet"
          required
          className="w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Add building
        </button>
      </form>

      <div className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {buildings.length === 0 ? (
          <p className="p-4 text-sm text-neutral-500">No buildings yet.</p>
        ) : (
          buildings.map((building) => (
            <div key={building.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{building.name}</p>
                <p className="text-xs text-neutral-500">
                  {building._count.users} user(s)
                </p>
              </div>
              <form action={deleteBuilding}>
                <input type="hidden" name="id" value={building.id} />
                <button
                  type="submit"
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
