import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";

export async function NavBar() {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin;

  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="font-serif text-lg text-white">
          LRT City <span className="text-accent">●</span>
        </Link>

        <nav className="flex items-center gap-6 font-mono text-[13px]">
          <Link href="/" className="text-white/70 transition-colors hover:text-white">
            Home
          </Link>
          <Link href="/resources" className="text-white/70 transition-colors hover:text-white">
            Resources
          </Link>
          <Link href="/users" className="text-white/70 transition-colors hover:text-white">
            Consumers
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-white/70 transition-colors hover:text-white">
              Administrative
            </Link>
          )}

          {isAdmin ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-white/20 px-3 py-1.5 text-[12px] text-white/80 hover:bg-white/10 hover:text-white"
              >
                Sign out
              </button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/admin" });
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-white/20 px-3 py-1.5 text-[12px] text-white/80 hover:bg-white/10 hover:text-white"
              >
                Admin sign in
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
