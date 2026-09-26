import type { OwnershipDocument } from "@prisma/client";
import { parseRupiah } from "@/lib/consumer-analytics";

type FinancialDocument = Pick<OwnershipDocument, "tuntutan" | "materialLossPaid" | "contractValue">;

export function summarizeConsumers(users: readonly { ownershipDocuments: readonly FinancialDocument[] }[]) {
  return users.reduce(
    (result, user) => {
      result.consumers += 1;
      for (const document of user.ownershipDocuments) {
        result.units += 1;
        result.contractValue += parseRupiah(document.contractValue);
        if (document.tuntutan?.trim().toLowerCase() === "refund") {
          result.materialLossPaid += parseRupiah(document.materialLossPaid);
        }
      }
      return result;
    },
    { consumers: 0, units: 0, materialLossPaid: 0, contractValue: 0 },
  );
}
