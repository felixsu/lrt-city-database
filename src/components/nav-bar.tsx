import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";

export async function NavBar() {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin;

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          LRT City Tebet Customer
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/users" className="hover:underline">
            Users
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:underline">
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
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                Sign out ({session?.user?.email})
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
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
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
