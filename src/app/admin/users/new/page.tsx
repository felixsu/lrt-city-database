import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { createUser } from "../actions";
import { UserForm } from "../user-form";

export default async function NewUserPage() {
  await requireAdmin();
  const [buildings, loanBanks] = await Promise.all([
    prisma.building.findMany({ orderBy: { name: "asc" } }),
    prisma.loanBank.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[26px]">Add resident</h1>

      <UserForm
        action={createUser}
        buildings={buildings}
        loanBanks={loanBanks}
        submitLabel="Create user"
      />
      <p className="-mt-4 text-xs text-muted">
        You&apos;ll be able to add ownership documents and photos after creating the user.
      </p>
    </div>
  );
}
