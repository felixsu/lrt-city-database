import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { ReorderableList } from "@/components/reorderable-list";
import {
  addMediaLink,
  updateMediaLink,
  refreshMediaLinkPreview,
  deleteMediaLink,
  reorderMediaLinks,
} from "./actions";

export default async function AdminMediaPage() {
  await requireAdmin();
  const links = await prisma.mediaLink.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px]">Media</h1>
        <p className="mt-1 text-sm text-muted">
          Add links to news coverage about LRT City. The title, description, and
          thumbnail are fetched automatically from the page and can be edited below.
          Drag rows to reorder.
        </p>
      </div>

      <form action={addMediaLink} className="flex gap-3">
        <input
          type="url"
          name="url"
          required
          placeholder="https://example.com/news-article"
          className="w-full max-w-md rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <Button type="submit" variant="primary" className="shrink-0">
          Fetch
        </Button>
      </form>

      <div className="rounded-xl border border-hairline bg-surface p-2">
        {links.length === 0 ? (
          <p className="p-4 text-sm text-muted">No media links yet.</p>
        ) : (
          <ReorderableList
            items={links.map((link) => ({
              id: link.id,
              content: (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {link.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary external domains, cannot be whitelisted
                    <img
                      src={link.imageUrl}
                      alt=""
                      className="h-20 w-full shrink-0 rounded-md object-cover sm:w-32"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-mono text-xs text-muted hover:underline"
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
                        className="rounded-lg border border-hairline bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent"
                      />
                      <textarea
                        name="description"
                        defaultValue={link.description ?? ""}
                        placeholder="Description"
                        rows={2}
                        className="rounded-lg border border-hairline bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="url"
                          name="imageUrl"
                          defaultValue={link.imageUrl ?? ""}
                          placeholder="Thumbnail image URL"
                          className="min-w-0 flex-1 rounded-lg border border-hairline bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent"
                        />
                        <input
                          type="date"
                          name="publishedAt"
                          defaultValue={
                            link.publishedAt ? link.publishedAt.toISOString().slice(0, 10) : ""
                          }
                          title="Posted date"
                          className="rounded-lg border border-hairline bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent"
                        />
                        <input
                          type="number"
                          name="order"
                          defaultValue={link.order}
                          title="Order (fallback for touch devices — drag the row above to reorder instead)"
                          className="w-20 rounded-lg border border-hairline bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">
                          Save
                        </Button>
                      </div>
                    </form>

                    <div className="mt-2 flex gap-2">
                      <form action={refreshMediaLinkPreview}>
                        <input type="hidden" name="id" value={link.id} />
                        <Button type="submit" size="sm">
                          Re-fetch preview
                        </Button>
                      </form>
                      <form action={deleteMediaLink}>
                        <input type="hidden" name="id" value={link.id} />
                        <Button type="submit" variant="danger" size="sm">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ),
            }))}
            reorderAction={reorderMediaLinks}
          />
        )}
      </div>
    </div>
  );
}
