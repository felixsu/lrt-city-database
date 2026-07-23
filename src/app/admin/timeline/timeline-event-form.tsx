import Image from "next/image";

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
    pictureUrl: string | null;
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

      <div>
        <label className="text-sm font-medium text-ink">
          Picture {defaultValues ? "(leave empty to keep current)" : ""}
        </label>
        {defaultValues?.pictureUrl && (
          <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-md bg-surface-soft">
            <Image src={defaultValues.pictureUrl} alt="Current" fill className="object-cover" />
          </div>
        )}
        <input type="file" name="picture" accept="image/*" className="mt-2 block w-full text-sm" />
        <p className="mt-1 text-xs text-muted">
          Automatically compressed to under 100KB and resized to max 2000px.
        </p>
      </div>
    </>
  );
}
