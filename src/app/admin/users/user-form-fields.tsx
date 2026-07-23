type Building = { id: string; name: string };

function toDateInputValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function UserFormFields({
  buildings,
  defaultValues,
}: {
  buildings: Building[];
  defaultValues?: {
    name: string;
    contactNumber: string;
    buildingId: string | null;
    remarks: string | null;
    buyDate: Date | null;
    joinDate: Date | null;
  };
}) {
  return (
    <>
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={defaultValues?.name}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Contact number</label>
        <input
          type="text"
          name="contactNumber"
          required
          defaultValue={defaultValues?.contactNumber}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>

      <div>
        <label className="text-sm font-medium">LRT City building</label>
        <select
          name="buildingId"
          defaultValue={defaultValues?.buildingId ?? ""}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        >
          <option value="">Unassigned</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium">Buy date</label>
          <input
            type="date"
            name="buyDate"
            defaultValue={toDateInputValue(defaultValues?.buyDate)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Join date</label>
          <input
            type="date"
            name="joinDate"
            defaultValue={toDateInputValue(defaultValues?.joinDate)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">
          Remarks{" "}
          <span className="font-normal text-neutral-500">
            (e.g. reason PPJB could not be provided)
          </span>
        </label>
        <textarea
          name="remarks"
          rows={3}
          defaultValue={defaultValues?.remarks ?? ""}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>
    </>
  );
}
