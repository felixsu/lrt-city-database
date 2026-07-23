import Link from "next/link";

const SECTIONS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/home", label: "Home Content" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/buildings", label: "Buildings" },
  { href: "/admin/timeline", label: "Timeline" },
  { href: "/admin/admins", label: "Admins" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <aside className="shrink-0 md:w-48">
        <nav className="flex flex-row flex-wrap gap-2 md:flex-col">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-md px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              {section.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
