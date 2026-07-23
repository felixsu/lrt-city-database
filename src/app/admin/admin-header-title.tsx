"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { ADMIN_SECTIONS } from "./admin-sidebar-nav";

export function AdminHeaderTitle() {
  const segment = useSelectedLayoutSegment();
  const section = ADMIN_SECTIONS.find((s) => s.segment === segment);
  return <div className="text-[15px] font-medium text-ink">{section?.label ?? "Dashboard"}</div>;
}
