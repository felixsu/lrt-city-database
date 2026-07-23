import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  const [userCount, buildingCount, timelineCount, adminCount] = await Promise.all([
    prisma.user.count(),
    prisma.building.count(),
    prisma.timelineEvent.count(),
    prisma.adminUser.count(),
  ]);

  const cards = [
    { label: "Users", value: userCount, href: "/admin/users" },
    { label: "Buildings", value: buildingCount, href: "/admin/buildings" },
    { label: "Timeline events", value: timelineCount, href: "/admin/timeline" },
    { label: "Admins", value: adminCount, href: "/admin/admins" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Signed in as {session.user?.email} ({session.user?.role})
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-sm text-neutral-500">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
