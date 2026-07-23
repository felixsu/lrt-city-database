import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Card } from "@/components/ui/card";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

function StatTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} prefetch={false}>
      <Card accent className="p-[22px] transition-colors hover:border-accent/40">
        <SectionEyebrow className="mb-2.5">{label}</SectionEyebrow>
        <div className="font-mono text-[32px] font-medium text-ink tabular-nums">{value}</div>
      </Card>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [userCount, buildingCount, timelineCount, adminCount] = await Promise.all([
    prisma.user.count(),
    prisma.building.count(),
    prisma.timelineEvent.count(),
    prisma.adminUser.count(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[26px]">Dashboard</h1>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <StatTile label="Consumers" value={userCount} href="/admin/users" />
        <StatTile label="Buildings" value={buildingCount} href="/admin/buildings" />
        <StatTile label="Timeline events" value={timelineCount} href="/admin/timeline" />
        <StatTile label="Admins" value={adminCount} href="/admin/admins" />
      </div>
    </div>
  );
}
