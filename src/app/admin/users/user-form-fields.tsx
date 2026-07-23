type Building = { id: string; name: string };

function toDateInputValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

const inputClass =
  "mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

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
        <label className="text-sm font-medium text-ink">Name</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={defaultValues?.name}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Contact number</label>
        <input
          type="text"
          name="contactNumber"
          required
          defaultValue={defaultValues?.contactNumber}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">LRT City building</label>
        <select
          name="buildingId"
          defaultValue={defaultValues?.buildingId ?? ""}
          className={inputClass}
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
          <label className="text-sm font-medium text-ink">Buy date</label>
          <input
            type="date"
            name="buyDate"
            defaultValue={toDateInputValue(defaultValues?.buyDate)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Join date</label>
          <input
            type="date"
            name="joinDate"
            defaultValue={toDateInputValue(defaultValues?.joinDate)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">
          Remarks{" "}
          <span className="font-normal text-muted">
            (e.g. reason PPJB could not be provided)
          </span>
        </label>
        <textarea
          name="remarks"
          rows={3}
          defaultValue={defaultValues?.remarks ?? ""}
          className={inputClass}
        />
      </div>
    </>
  );
}
