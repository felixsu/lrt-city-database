import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  updateUser,
  deleteUser,
  addPpjb,
  deletePpjb,
  addPpjbPhoto,
  deletePpjbPhoto,
} from "../actions";
import { UserForm } from "../user-form";

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
        <h1 className="text-[26px]">{user.name}</h1>
        <p className="mt-1 text-sm text-muted">Manage user record and PPJB accounts.</p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-ink">Details</h2>
        <div className="mt-3">
          <UserForm
            action={updateUser}
            buildings={buildings}
            hiddenId={user.id}
            submitLabel="Save changes"
            defaultValues={{
              name: user.name,
              unitNumber: user.unitNumber,
              contactNumber: user.contactNumber,
              buildingId: user.buildingId,
              remarks: user.remarks,
              buyDate: user.buyDate,
              joinDate: user.joinDate,
            }}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-ink">PPJB Accounts</h2>

        <div className="mt-3 flex flex-col gap-4">
          {user.ppjbs.map((ppjb) => (
            <Card key={ppjb.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-ink">{ppjb.accountNumber}</span>
                <form action={deletePpjb}>
                  <input type="hidden" name="id" value={ppjb.id} />
                  <input type="hidden" name="userId" value={user.id} />
                  <Button type="submit" variant="danger" size="sm">
                    Delete PPJB
                  </Button>
                </form>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                {ppjb.photos.map((photo) => (
                  <div key={photo.id} className="flex flex-col items-center gap-1">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md bg-surface-soft">
                      <Image src={photo.url} alt="PPJB" fill className="object-cover" />
                    </div>
                    <form action={deletePpjbPhoto}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">
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
                <Button type="submit" size="sm">
                  Add photo
                </Button>
              </form>
            </Card>
          ))}

          <form
            action={addPpjb}
            encType="multipart/form-data"
            className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-hairline p-4"
          >
            <input type="hidden" name="userId" value={user.id} />
            <div>
              <label className="text-sm font-medium text-ink">PPJB account number</label>
              <input
                type="text"
                name="accountNumber"
                required
                placeholder="e.g. 005/ACP-TPM/PPJB/II/2024"
                className="mt-1 w-72 rounded-lg border border-hairline bg-surface px-3 py-2 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-muted">
                Format: sequence/developer-code/PPJB/month-roman/year.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Photo (optional)</label>
              <input type="file" name="photo" accept="image/*" className="mt-1 block text-sm" />
            </div>
            <Button type="submit" variant="primary">
              Add PPJB
            </Button>
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-red-600">Danger zone</h2>
        <form action={deleteUser} className="mt-3">
          <input type="hidden" name="id" value={user.id} />
          <Button type="submit" variant="danger">
            Delete user
          </Button>
        </form>
      </section>
    </div>
  );
}
