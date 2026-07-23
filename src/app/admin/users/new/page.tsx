import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { createUser } from "../actions";
import { UserFormFields } from "../user-form-fields";

export default async function NewUserPage() {
  await requireAdmin();
  const buildings = await prisma.building.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add User</h1>

      <form action={createUser} className="flex max-w-lg flex-col gap-4">
        <UserFormFields buildings={buildings} />
        <button
          type="submit"
          className="mt-2 self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Create user
        </button>
        <p className="text-xs text-neutral-500">
          You&apos;ll be able to add PPJB accounts and photos after creating the user.
        </p>
      </form>
    </div>
  );
}
