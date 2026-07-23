import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import {
  updateUser,
  deleteUser,
  createOwnershipDocument,
  updateOwnershipDocument,
  deleteOwnershipDocument,
  addOwnershipDocumentPhoto,
  deleteOwnershipDocumentPhoto,
} from "../actions";
import { UserForm } from "../user-form";
import { OwnershipDocumentCard, CreateOwnershipDocumentForm } from "./ownership-document-forms";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [user, buildings, loanBanks] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        ownershipDocuments: { include: { photos: true }, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.building.findMany({ orderBy: { name: "asc" } }),
    prisma.loanBank.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!user) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-[26px]">{user.name}</h1>
        <p className="mt-1 text-sm text-muted">Manage user record and ownership documents.</p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-ink">Details</h2>
        <div className="mt-3">
          <UserForm
            action={updateUser}
            buildings={buildings}
            loanBanks={loanBanks}
            hiddenId={user.id}
            submitLabel="Save changes"
            defaultValues={{
              name: user.name,
              unitNumber: user.unitNumber,
              unitType: user.unitType,
              contactNumber: user.contactNumber,
              buildingId: user.buildingId,
              loanBankId: user.loanBankId,
              paymentStatus: user.paymentStatus,
              paidOffDate: user.paidOffDate,
              remarks: user.remarks,
            }}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-ink">Ownership documents</h2>

        <div className="mt-3 flex flex-col gap-4">
          {user.ownershipDocuments.map((doc) => (
            <OwnershipDocumentCard
              key={doc.id}
              document={doc}
              userId={user.id}
              updateAction={updateOwnershipDocument}
              deleteAction={deleteOwnershipDocument}
              addPhotoAction={addOwnershipDocumentPhoto}
              deletePhotoAction={deleteOwnershipDocumentPhoto}
            />
          ))}

          <CreateOwnershipDocumentForm action={createOwnershipDocument} userId={user.id} />
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
