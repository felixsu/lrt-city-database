"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEAD_STATUS_LABELS } from "@/lib/user-enums";
import { convertLead, deleteLead, type LeadConvertState } from "./actions";

type Lead = {
  id: string;
  fullName: string;
  contactNumber: string;
  unitNumber: string;
  ppjbNumber: string;
  sppuNumber: string;
  buildingName: string;
  status: "NEW" | "CONVERTED";
  createdAt: string;
};

export function LeadRow({ lead }: { lead: Lead }) {
  const [state, formAction, pending] = useActionState<LeadConvertState, FormData>(convertLead, {
    error: null,
  });

  return (
    <tr>
      <td className="px-4 py-3.5 font-medium text-ink">{lead.fullName}</td>
      <td className="px-4 py-3.5 font-mono text-xs text-ink">{lead.contactNumber}</td>
      <td className="px-4 py-3.5 font-mono text-xs text-ink">{lead.unitNumber}</td>
      <td className="px-4 py-3.5 font-mono text-xs text-ink">{lead.ppjbNumber}</td>
      <td className="px-4 py-3.5 font-mono text-xs text-ink">{lead.sppuNumber}</td>
      <td className="px-4 py-3.5 text-ink">{lead.buildingName}</td>
      <td className="px-4 py-3.5 text-ink">{LEAD_STATUS_LABELS[lead.status]}</td>
      <td className="px-4 py-3.5 font-mono text-xs text-muted">{lead.createdAt}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-2">
          {lead.status === "NEW" && (
            <form action={formAction}>
              <input type="hidden" name="id" value={lead.id} />
              <Button type="submit" variant="primary" size="sm" disabled={pending}>
                {pending ? "Converting..." : "Convert"}
              </Button>
            </form>
          )}
          <form action={deleteLead}>
            <input type="hidden" name="id" value={lead.id} />
            <Button type="submit" variant="danger" size="sm" aria-label="Delete lead">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
        {state.error && <p className="mt-1.5 text-right text-xs text-red-600">{state.error}</p>}
      </td>
    </tr>
  );
}
