import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { addBuilding } from "./actions";
import { BuildingRow } from "./building-row";

export default async function AdminBuildingsPage() {
  await requireAdmin();
  const buildings = await prisma.building.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px]">Buildings</h1>
          <p className="mt-1 text-sm text-muted">
            Manage the list of LRT City buildings available when assigning users.
          </p>
        </div>
        <form action={addBuilding} className="flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="e.g. Tower C"
            required
            className="w-48 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="number"
            name="totalUnits"
            min="0"
            placeholder="Total units"
            className="w-32 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" variant="primary">
            <Plus className="h-4 w-4" /> Add building
          </Button>
        </form>
      </div>

      <div className="max-w-xl divide-y divide-hairline-soft rounded-xl border border-hairline bg-surface">
        {buildings.length === 0 ? (
          <p className="p-4 text-sm text-muted">No buildings yet.</p>
        ) : (
          buildings.map((building) => <BuildingRow key={building.id} building={building} />)
        )}
      </div>
    </div>
  );
}
