import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { createUser } from "../actions";
import { UserFormFields } from "../user-form-fields";

export default async function NewUserPage() {
  await requireAdmin();
  const buildings = await prisma.building.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[26px]">Add resident</h1>

      <form action={createUser} className="flex max-w-lg flex-col gap-4">
        <UserFormFields buildings={buildings} />
        <Button type="submit" variant="primary" className="mt-2 self-start">
          Create user
        </Button>
        <p className="text-xs text-muted">
          You&apos;ll be able to add PPJB accounts and photos after creating the user.
        </p>
      </form>
    </div>
  );
}
