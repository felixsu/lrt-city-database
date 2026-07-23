import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import {
  updateUser,
  deleteUser,
  addPpjb,
  deletePpjb,
  addPpjbPhoto,
  deletePpjbPhoto,
} from "../actions";
import { UserFormFields } from "../user-form-fields";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [user, buildings] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: { ppjbs: { include: { photos: true }, orderBy: { createdAt: "asc" } } },
    }),
    prisma.building.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!user) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage user record and PPJB accounts.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Details</h2>
        <form action={updateUser} className="mt-3 flex max-w-lg flex-col gap-4">
          <input type="hidden" name="id" value={user.id} />
          <UserFormFields
            buildings={buildings}
            defaultValues={{
              name: user.name,
              contactNumber: user.contactNumber,
              buildingId: user.buildingId,
              remarks: user.remarks,
              buyDate: user.buyDate,
              joinDate: user.joinDate,
            }}
          />
          <button
            type="submit"
            className="mt-2 self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            Save changes
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">PPJB Accounts</h2>

        <div className="mt-3 flex flex-col gap-4">
          {user.ppjbs.map((ppjb) => (
            <div key={ppjb.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{ppjb.accountNumber}</span>
                <form action={deletePpjb}>
                  <input type="hidden" name="id" value={ppjb.id} />
                  <input type="hidden" name="userId" value={user.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete PPJB
                  </button>
                </form>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                {ppjb.photos.map((photo) => (
                  <div key={photo.id} className="flex flex-col items-center gap-1">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
                      <Image src={photo.url} alt="PPJB" fill className="object-cover" />
                    </div>
                    <form action={deletePpjbPhoto}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline dark:text-red-400">
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
              </div>

              <form
                action={addPpjbPhoto}
                encType="multipart/form-data"
                className="mt-3 flex items-center gap-2"
              >
                <input type="hidden" name="ppjbId" value={ppjb.id} />
                <input type="hidden" name="userId" value={user.id} />
                <input type="file" name="photo" accept="image/*" required className="text-xs" />
                <button
                  type="submit"
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                >
                  Add photo
                </button>
              </form>
            </div>
          ))}

          <form
            action={addPpjb}
            encType="multipart/form-data"
            className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-neutral-300 p-4 dark:border-neutral-700"
          >
            <input type="hidden" name="userId" value={user.id} />
            <div>
              <label className="text-sm font-medium">PPJB account number</label>
              <input
                type="text"
                name="accountNumber"
                required
                className="mt-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Photo (optional)</label>
              <input type="file" name="photo" accept="image/*" className="mt-1 block text-sm" />
            </div>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
            >
              Add PPJB
            </button>
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger zone</h2>
        <form action={deleteUser} className="mt-3">
          <input type="hidden" name="id" value={user.id} />
          <button
            type="submit"
            className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            Delete user
          </button>
        </form>
      </section>
    </div>
  );
}
