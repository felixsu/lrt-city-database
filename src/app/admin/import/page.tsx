import { requireAdmin } from "@/lib/require-admin";
import { CSVImportWizard } from "./csv-import-wizard";

export default async function AdminImportPage() {
  await requireAdmin();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px]">Replace consumer data</h1>
        <p className="mt-1 text-sm text-muted">Upload a CSV, verify exact duplicate keys, then replace the consumer dataset in one protected action.</p>
      </div>
      <CSVImportWizard />
    </div>
  );
}
