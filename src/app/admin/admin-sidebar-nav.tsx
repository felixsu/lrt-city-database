"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Landmark,
  Milestone,
  Newspaper,
  Shield,
  Settings,
} from "lucide-react";

export const ADMIN_SECTIONS = [
  { segment: null, href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { segment: "home", href: "/admin/home", label: "Home content", icon: FileText },
  { segment: "users", href: "/admin/users", label: "Consumers", icon: Users },
  { segment: "buildings", href: "/admin/buildings", label: "Buildings", icon: Building2 },
  { segment: "loan-banks", href: "/admin/loan-banks", label: "Loan banks", icon: Landmark },
  { segment: "timeline", href: "/admin/timeline", label: "Timeline", icon: Milestone },
  { segment: "media", href: "/admin/media", label: "Media", icon: Newspaper },
  { segment: "admins", href: "/admin/admins", label: "Admins", icon: Shield },
  { segment: "settings", href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebarNav() {
  const segment = useSelectedLayoutSegment();

  return (
    <div className="flex flex-1 flex-col gap-0.5 p-3">
      {ADMIN_SECTIONS.map((section) => {
        const active = segment === section.segment;
        const Icon = section.icon;
        return (
          <Link
            key={section.href}
            href={section.href}
            prefetch={false}
            className={`-ml-[3px] flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-2.5 text-sm font-medium ${
              active
                ? "border-accent bg-accent/18 text-white"
                : "border-transparent text-white/60 hover:text-white/90"
            }`}
          >
            <Icon className="h-[17px] w-[17px] flex-none" />
            {section.label}
          </Link>
        );
      })}
    </div>
  );
}
