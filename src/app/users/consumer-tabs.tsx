"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ArrowUpDown, TriangleAlert } from "lucide-react";
import { maskContactNumber, maskDocumentNumber, maskName } from "@/lib/mask";
import type { Prisma } from "@prisma/client";

type DocumentWithRelations = Prisma.OwnershipDocumentGetPayload<{
  include: { user: { include: { building: true } }; photos: true };
}>;

export type ConsumerGroup = {
  key: string;
  name: string;
  documents: DocumentWithRelations[];
  totalUnits?: number | null;
};

type SortColumn = "name" | "unit";
type SortDir = "asc" | "desc";

function SortableHeader({
  label,
  column,
  sortColumn,
  sortDir,
  onSort,
}: {
  label: string;
  column: SortColumn;
  sortColumn: SortColumn | null;
  sortDir: SortDir;
  onSort: (column: SortColumn) => void;
}) {
  const isActive = sortColumn === column;
  const Icon = isActive ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={`flex items-center gap-1 font-mono text-[11px] tracking-[0.5px] uppercase ${
        isActive ? "text-ink" : "text-muted hover:text-ink"
      }`}
    >
      {label}
      <Icon className="h-3 w-3" />
    </button>
  );
}

export function ConsumerTabs({
  groups,
  initialKey,
}: {
  groups: ConsumerGroup[];
  initialKey: string;
}) {
  const [activeKey, setActiveKey] = useState(initialKey);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const tabListRef = useRef<HTMLDivElement>(null);
  const activeGroup = groups.find((g) => g.key === activeKey) ?? groups[0];
  const activeIndex = groups.findIndex((group) => group.key === activeGroup?.key);

  useEffect(() => {
    tabListRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeGroup?.key]);

  const sortedDocuments = useMemo(() => {
    if (!activeGroup || !sortColumn) return activeGroup?.documents ?? [];
    const dir = sortDir === "asc" ? 1 : -1;
    return [...activeGroup.documents].sort((a, b) => {
      if (sortColumn === "name") {
        return dir * a.user.name.localeCompare(b.user.name);
      }
      if (!a.unitNumber) return 1;
      if (!b.unitNumber) return -1;
      return dir * a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true });
    });
  }, [activeGroup, sortColumn, sortDir]);

  function handleSort(column: SortColumn) {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDir("asc");
    } else {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % groups.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + groups.length) % groups.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = groups.length - 1;
    else return;

    event.preventDefault();
    setActiveKey(groups[nextIndex].key);
    const nextTab = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex];
    nextTab?.focus();
    nextTab?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  const registeredUsers = useMemo(
    () => new Set(activeGroup?.documents.map((doc) => doc.user.id)).size,
    [activeGroup],
  );

  return (
    <div>
      <div className="mb-6 max-w-full overflow-x-auto overscroll-x-contain border-b border-hairline">
        <div ref={tabListRef} role="tablist" aria-label="Project locations" className="flex w-max min-w-full flex-nowrap gap-2">
          {groups.map((group, index) => (
            <button
              key={group.key}
              type="button"
              id={`consumer-project-tab-${index}`}
              role="tab"
              aria-selected={group.key === activeGroup?.key}
              aria-controls="consumer-project-panel"
              tabIndex={group.key === activeGroup?.key ? 0 : -1}
              onClick={() => setActiveKey(group.key)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`-mb-px flex shrink-0 items-center gap-2 whitespace-nowrap rounded-t-lg border border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                group.key === activeGroup?.key
                  ? "border-accent bg-accent/10 text-accent-strong"
                  : "border-transparent text-muted hover:border-hairline hover:bg-surface-soft hover:text-ink"
              }`}
            >
              {group.name}
              <span className="rounded-full bg-surface-soft px-1.5 py-0.5 font-mono text-[11px] text-muted">
                {group.documents.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div id="consumer-project-panel" role="tabpanel" aria-labelledby={activeIndex >= 0 ? `consumer-project-tab-${activeIndex}` : undefined} tabIndex={0}>
      {activeGroup && (
        <div className="mb-6 font-mono text-xs text-muted">
          Total units: {activeGroup.totalUnits ?? "—"} · Registered with us:{" "}
          {activeGroup.documents.length} unit{activeGroup.documents.length === 1 ? "" : "s"} (from{" "}
          {registeredUsers} user{registeredUsers === 1 ? "" : "s"})
        </div>
      )}

      {!activeGroup || activeGroup.documents.length === 0 ? (
        <p className="text-sm text-muted">No units match.</p>
      ) : (
        <div>
          <div className="hidden border-b border-hairline pb-2.5 sm:grid sm:grid-cols-[0.9fr_0.6fr_0.9fr_1.1fr_0.9fr] sm:gap-4">
            <SortableHeader
              label="Name"
              column="name"
              sortColumn={sortColumn}
              sortDir={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Unit"
              column="unit"
              sortColumn={sortColumn}
              sortDir={sortDir}
              onSort={handleSort}
            />
            <div className="font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
              Contact
            </div>
            <div className="font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
              PPJB No
            </div>
            <div className="font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
              SPPU No
            </div>
          </div>

          {sortedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="grid grid-cols-1 gap-4 border-b border-hairline-soft py-4 sm:grid-cols-[0.9fr_0.6fr_0.9fr_1.1fr_0.9fr]"
            >
              <div>
                <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase sm:hidden">
                  Name
                </div>
                <div className="font-mono text-sm text-ink">{maskName(doc.user.name)}</div>
              </div>
              <div>
                <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase sm:hidden">
                  Unit
                </div>
                <div className="font-mono text-sm text-ink">{doc.unitNumber ?? "—"}</div>
              </div>
              <div>
                <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase sm:hidden">
                  Contact
                </div>
                <div className="font-mono text-sm text-ink">
                  {maskContactNumber(doc.user.contactNumber)}
                </div>
              </div>
              <div>
                <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase sm:hidden">
                  PPJB No
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {doc.accountNumber ? (
                    <span className="rounded-md border border-hairline bg-surface-soft px-2 py-0.5 font-mono text-xs text-ink">
                      {maskDocumentNumber(doc.accountNumber)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent-strong">
                      <TriangleAlert className="h-2.5 w-2.5" /> No PPJB
                    </span>
                  )}
                  {doc.photos.slice(0, 2).map((photo) => (
                    <div
                      key={photo.id}
                      className="relative h-[18px] w-[18px] overflow-hidden rounded-sm border border-hairline"
                    >
                      <Image src={photo.url} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase sm:hidden">
                  SPPU No
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {doc.sppuNumber ? (
                    <span className="rounded-md border border-hairline bg-surface-soft px-2 py-0.5 font-mono text-xs text-ink">
                      {maskDocumentNumber(doc.sppuNumber)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent-strong">
                      <TriangleAlert className="h-2.5 w-2.5" /> No SPPU
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
