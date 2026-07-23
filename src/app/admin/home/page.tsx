import { requireAdmin } from "@/lib/require-admin";
import { getHomeContent } from "@/lib/home-content";
import { HomeContentForm } from "./home-content-form";

export default async function AdminHomeContentPage() {
  await requireAdmin();
  const homeContent = await getHomeContent();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px]">Home content</h1>
        <p className="mt-1 text-sm text-muted">
          Edit the About and How to Join sections shown on the public home page.
        </p>
      </div>

      <HomeContentForm
        initialAbout={homeContent.aboutMarkdown}
        initialHowToJoin={homeContent.howToJoinMarkdown}
      />
    </div>
  );
}
