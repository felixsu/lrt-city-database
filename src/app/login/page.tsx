import { redirect } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { auth, signIn } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  if (session?.user?.isAdmin) {
    redirect(callbackUrl || "/admin");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-1.5">
        <div
          className="flex-1"
          style={{
            background:
              "repeating-linear-gradient(90deg, #1B2430 0 18px, transparent 18px 28px)",
          }}
        />
        <div
          className="flex-1"
          style={{
            background:
              "repeating-linear-gradient(90deg, #C1720F 0 18px, transparent 18px 28px)",
          }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center p-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-[18px] flex items-center gap-2 font-mono text-[11px] tracking-[1px] text-muted uppercase">
            <span className="h-2 w-2 bg-ink" /> Public line
            <span className="text-hairline">→</span>
            <span className="h-2 w-2 bg-accent" /> Admin line
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-9">
            <h1 className="mb-2 text-[28px]">Admin sign-in</h1>
            <p className="mb-7 text-sm text-muted">
              Google SSO only. Access is granted by invitation — there is no
              self-serve sign-up.
            </p>

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl || "/admin" });
              }}
            >
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-hairline bg-canvas text-sm font-medium text-ink hover:bg-surface-soft"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.4 0 6.4 1.2 8.8 3.5l6.6-6.6C35.3 2.5 30 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.7 6C12.2 13 17.6 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7C43.6 37.9 46.5 31.8 46.5 24.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.3 19.2A14.5 14.5 0 0 0 9.5 24c0 1.7.3 3.3.8 4.8l-7.7 6A24 24 0 0 1 0 24c0-3.9.9-7.5 2.6-10.8l7.7 6z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6 0 11.3-2 15-5.4l-7.3-5.7c-2 1.4-4.6 2.2-7.7 2.2-6.4 0-11.8-3.5-13.7-8.7l-7.7 6C6.5 42.6 14.6 48 24 48z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>

            {error && (
              <div className="mt-6 rounded-xl border border-accent/35 bg-accent/8 px-[18px] py-4">
                <div className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-accent-strong">
                  <TriangleAlert className="h-[15px] w-[15px]" /> Sign-in blocked
                </div>
                <p className="text-[13px] leading-relaxed text-accent-strong">
                  This Google account isn&apos;t registered as an administrator.
                  Contact a super admin to request access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
