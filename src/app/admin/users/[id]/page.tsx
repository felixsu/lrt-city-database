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
import { AddPpjbForm, AddPpjbPhotoForm } from "./ppjb-forms";

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

              <AddPpjbPhotoForm action={addPpjbPhoto} ppjbId={ppjb.id} userId={user.id} />
            </Card>
          ))}

          <AddPpjbForm action={addPpjb} userId={user.id} />
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
