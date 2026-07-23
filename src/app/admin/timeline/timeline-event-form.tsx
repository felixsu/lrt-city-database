import Image from "next/image";

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
        <label className="text-sm font-medium">Title</label>
        <input
          type="text"
          name="title"
          required
          defaultValue={defaultValues?.title}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={5}
          defaultValue={defaultValues?.description}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        />
      </div>

      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium">Event date</label>
          <input
            type="date"
            name="eventDate"
            defaultValue={eventDateValue}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Order</label>
          <input
            type="number"
            name="order"
            defaultValue={defaultValues?.order ?? 0}
            className="mt-1 w-24 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">
          Picture {defaultValues ? "(leave empty to keep current)" : ""}
        </label>
        {defaultValues?.pictureUrl && (
          <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
            <Image src={defaultValues.pictureUrl} alt="Current" fill className="object-cover" />
          </div>
        )}
        <input
          type="file"
          name="picture"
          accept="image/*"
          className="mt-2 block w-full text-sm"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Automatically compressed to under 100KB and resized to max 2000px.
        </p>
      </div>
    </>
  );
}
