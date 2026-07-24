import { NavBar } from "@/components/nav-bar";
import { RegistrationFab } from "@/components/registration-fab";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-hairline px-6 py-6 text-center font-mono text-xs text-muted">
        LRT City Consumer Community
      </footer>
      <RegistrationFab />
    </div>
  );
}
