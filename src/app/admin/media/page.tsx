import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import {
  addMediaLink,
  updateMediaLink,
  refreshMediaLinkPreview,
  deleteMediaLink,
} from "./actions";

export default async function AdminMediaPage() {
  await requireAdmin();
  const links = await prisma.mediaLink.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Add links to news coverage about LRT City. The title, description,
          and thumbnail are fetched automatically from the page and can be
          edited below.
        </p>
      </div>

      <form action={addMediaLink} className="flex gap-3">
        <input
          type="url"
          name="url"
          required
          placeholder="https://example.com/news-article"
          className="w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Add link
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {links.length === 0 ? (
          <p className="text-sm text-neutral-500">No media links yet.</p>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 sm:flex-row dark:border-neutral-800"
            >
              {link.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary external domains, cannot be whitelisted
                <img
                  src={link.imageUrl}
                  alt=""
                  className="h-28 w-full shrink-0 rounded-md object-cover sm:w-40"
                />
              )}

              <div className="flex-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-xs text-neutral-500 hover:underline"
                >
                  {link.url}
                </a>

                <form action={updateMediaLink} className="mt-2 flex flex-col gap-2">
                  <input type="hidden" name="id" value={link.id} />
                  <input
                    type="text"
                    name="title"
                    defaultValue={link.title ?? ""}
                    placeholder="Title"
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                  />
                  <textarea
                    name="description"
                    defaultValue={link.description ?? ""}
                    placeholder="Description"
                    rows={2}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="url"
                      name="imageUrl"
                      defaultValue={link.imageUrl ?? ""}
                      placeholder="Thumbnail image URL"
                      className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                    />
                    <input
                      type="number"
                      name="order"
                      defaultValue={link.order}
                      className="w-20 rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                    >
                      Save
                    </button>
                  </div>
                </form>

                <div className="mt-2 flex gap-2">
                  <form action={refreshMediaLinkPreview}>
                    <input type="hidden" name="id" value={link.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                    >
                      Re-fetch preview
                    </button>
                  </form>
                  <form action={deleteMediaLink}>
                    <input type="hidden" name="id" value={link.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
