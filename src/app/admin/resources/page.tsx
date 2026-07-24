import { Trash2 } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { ReorderableList } from "@/components/reorderable-list";
import { addResource, updateResource, deleteResource, reorderResources } from "./actions";

export default async function AdminResourcesPage() {
  await requireAdmin();
  const resources = await prisma.resource.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px]">Resources</h1>
        <p className="mt-1 text-sm text-muted">
          Publish resources the community has gathered — a title, an image, and a
          description. Drag rows to reorder.
        </p>
      </div>

      <form
        action={addResource}
        encType="multipart/form-data"
        className="flex flex-col gap-2 rounded-xl border border-hairline bg-surface p-4"
      >
        <input
          type="text"
          name="title"
          required
          placeholder="Title"
          className="rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <textarea
          name="description"
          required
          placeholder="Description"
          rows={2}
          className="rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          className="text-sm text-muted"
        />
        <Button type="submit" variant="primary" className="self-start">
          Add resource
        </Button>
      </form>

      <div className="rounded-xl border border-hairline bg-surface p-2">
        {resources.length === 0 ? (
          <p className="p-4 text-sm text-muted">No resources yet.</p>
        ) : (
          <ReorderableList
            items={resources.map((resource) => ({
              id: resource.id,
              content: (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {resource.imageUrl && (
                    <Image
                      src={resource.imageUrl}
                      alt=""
                      width={128}
                      height={80}
                      className="h-20 w-full shrink-0 rounded-md object-cover sm:w-32"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <form action={updateResource} className="flex flex-col gap-2">
                      <input type="hidden" name="id" value={resource.id} />
                      <input
                        type="text"
                        name="title"
                        defaultValue={resource.title}
                        placeholder="Title"
                        className="rounded-lg border border-hairline bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent"
                      />
                      <textarea
                        name="description"
                        defaultValue={resource.description}
                        placeholder="Description"
                        rows={2}
                        className="rounded-lg border border-hairline bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          title="Upload to replace the current image"
                          className="min-w-0 flex-1 text-sm text-muted"
                        />
                        <input
                          type="number"
                          name="order"
                          defaultValue={resource.order}
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

                    <form action={deleteResource} className="mt-2">
                      <input type="hidden" name="id" value={resource.id} />
                      <Button type="submit" variant="danger" size="sm">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ),
            }))}
            reorderAction={reorderResources}
          />
        )}
      </div>
    </div>
  );
}
