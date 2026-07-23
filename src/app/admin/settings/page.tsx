import { requireAdmin } from "@/lib/require-admin";
import { getUploadSettings } from "@/lib/upload-settings";
import { UploadSettingsForm } from "./upload-settings-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getUploadSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px]">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Configure per-file upload size limits used across the app.
        </p>
      </div>

      <UploadSettingsForm
        initialTimelineMaxUploadMb={settings.timelineMaxUploadMb}
        initialPpjbMaxUploadMb={settings.ppjbMaxUploadMb}
      />
    </div>
  );
}
