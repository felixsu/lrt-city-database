"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateBuilding, deleteBuilding } from "./actions";

export function BuildingRow({
  building,
}: {
  building: { id: string; name: string; _count: { users: number } };
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <form
        action={async (formData) => {
          await updateBuilding(formData);
          setIsEditing(false);
        }}
        className="flex items-center gap-2 p-4"
      >
        <input type="hidden" name="id" value={building.id} />
        <input
          type="text"
          name="name"
          defaultValue={building.name}
          required
          autoFocus
          className="flex-1 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <Button type="submit" variant="primary" size="sm">
          Save
        </Button>
        <Button type="button" size="sm" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium text-ink">{building.name}</p>
        <p className="font-mono text-xs text-muted">{building._count.users} residents</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-muted hover:text-ink"
          aria-label="Rename building"
        >
          <Pencil className="h-[15px] w-[15px]" />
        </button>
        <form action={deleteBuilding}>
          <input type="hidden" name="id" value={building.id} />
          <button type="submit" className="text-muted hover:text-red-600" aria-label="Delete building">
            <Trash2 className="h-[15px] w-[15px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
