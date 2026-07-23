import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Button } from "@/components/ui/button";
import { addLoanBank } from "./actions";
import { LoanBankRow } from "./loan-bank-row";

export default async function AdminLoanBanksPage() {
  await requireAdmin();
  const loanBanks = await prisma.loanBank.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px]">Loan banks</h1>
          <p className="mt-1 text-sm text-muted">
            Manage the list of banks available when recording a resident&apos;s loan.
          </p>
        </div>
        <form action={addLoanBank} className="flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="e.g. Mandiri"
            required
            className="w-48 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" variant="primary">
            <Plus className="h-4 w-4" /> Add bank
          </Button>
        </form>
      </div>

      <div className="max-w-xl divide-y divide-hairline-soft rounded-xl border border-hairline bg-surface">
        {loanBanks.length === 0 ? (
          <p className="p-4 text-sm text-muted">No loan banks yet.</p>
        ) : (
          loanBanks.map((loanBank) => <LoanBankRow key={loanBank.id} loanBank={loanBank} />)
        )}
      </div>
    </div>
  );
}
