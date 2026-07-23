import Link from "next/link";
import { auth } from "@/lib/auth";
import { RolePill } from "@/components/ui/pill";
import { AdminSidebarNav } from "./admin-sidebar-nav";
import { AdminHeaderTitle } from "./admin-header-title";

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email || "";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-none flex-col bg-ink text-white">
        <div className="border-b border-white/10 px-[22px] py-[18px]">
          <Link href="/admin" className="font-serif text-[19px] text-white">
            LRT City <span className="text-accent">●</span>
          </Link>
          <div className="mt-1 font-mono text-[10px] tracking-[1px] text-white/50 uppercase">
            Admin line
          </div>
        </div>

        <AdminSidebarNav />

        <div className="border-t border-white/10 px-[22px] py-4 font-mono text-[10px] text-white/40">
          ◆ dashed line · sign-in required
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 flex-none items-center justify-between border-b border-hairline bg-surface px-7">
          <AdminHeaderTitle />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">{user?.email}</span>
            {user?.role && <RolePill role={user.role} />}
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-hairline bg-surface-soft text-sm font-medium text-ink">
              {initials(user?.name, user?.email)}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-canvas p-8">{children}</div>
      </div>
    </div>
  );
}
