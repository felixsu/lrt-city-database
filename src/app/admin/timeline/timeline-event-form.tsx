const inputClass =
  "mt-1 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export function TimelineEventFormFields({
  defaultValues,
}: {
  defaultValues?: {
    title: string;
    description: string;
    order: number;
    eventDate: Date | null;
  };
}) {
  const eventDateValue = defaultValues?.eventDate
    ? defaultValues.eventDate.toISOString().slice(0, 10)
    : "";

  return (
    <>
      <div>
        <label className="text-sm font-medium text-ink">Title</label>
        <input
          type="text"
          name="title"
          required
          defaultValue={defaultValues?.title}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Description</label>
        <textarea
          name="description"
          rows={5}
          defaultValue={defaultValues?.description}
          className={inputClass}
        />
      </div>

      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium text-ink">Event date</label>
          <input
            type="date"
            name="eventDate"
            defaultValue={eventDateValue}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">
            Order <span className="font-normal text-muted">(drag to reorder on the list page)</span>
          </label>
          <input
            type="number"
            name="order"
            defaultValue={defaultValues?.order ?? 0}
            className={`${inputClass} w-24`}
          />
        </div>
      </div>
    </>
  );
}
