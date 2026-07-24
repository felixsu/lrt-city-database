"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ArrowUpDown, TriangleAlert } from "lucide-react";
import { maskContactNumber, maskName } from "@/lib/mask";
import { UNIT_TYPE_LABELS, type UnitType } from "@/lib/user-enums";
import type { Prisma } from "@prisma/client";

type DocumentWithRelations = Prisma.OwnershipDocumentGetPayload<{
  include: { user: { include: { building: true } }; photos: true };
}>;

export type ConsumerGroup = {
  key: string;
  name: string;
  documents: DocumentWithRelations[];
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
  const activeGroup = groups.find((g) => g.key === activeKey) ?? groups[0];

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

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-hairline">
        {groups.map((group) => (
          <button
            key={group.key}
            type="button"
            onClick={() => setActiveKey(group.key)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
              group.key === activeGroup?.key
                ? "border-accent text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {group.name}
            <span className="rounded-full bg-surface-soft px-1.5 py-0.5 font-mono text-[11px] text-muted">
              {group.documents.length}
            </span>
          </button>
        ))}
      </div>

      {!activeGroup || activeGroup.documents.length === 0 ? (
        <p className="text-sm text-muted">No units match.</p>
      ) : (
        <div>
          <div className="hidden border-b border-hairline pb-2.5 sm:grid sm:grid-cols-[0.9fr_0.7fr_1fr_1.3fr_1.3fr_1.2fr] sm:gap-4">
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
              Unit type
            </div>
            <div className="font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
              PPJB / SPPU
            </div>
            <div className="font-mono text-[11px] tracking-[0.5px] text-muted uppercase">
              Remarks
            </div>
          </div>

          {sortedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="grid grid-cols-1 gap-4 border-b border-hairline-soft py-4 sm:grid-cols-[0.9fr_0.7fr_1fr_1.3fr_1.3fr_1.2fr]"
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
                  Unit type
                </div>
                <div className="font-mono text-sm text-ink">
                  {doc.unitType ? UNIT_TYPE_LABELS[doc.unitType as UnitType] : "—"}
                </div>
              </div>
              <div>
                <div className="mb-1 font-mono text-[11px] tracking-[0.5px] text-muted uppercase sm:hidden">
                  PPJB / SPPU
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {doc.accountNumber ? (
                    <span className="rounded-md border border-hairline bg-surface-soft px-2 py-0.5 font-mono text-xs text-ink">
                      {doc.accountNumber}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent-strong">
                      <TriangleAlert className="h-2.5 w-2.5" /> No PPJB
                    </span>
                  )}
                  {!doc.sppuNumber && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent-strong">
                      <TriangleAlert className="h-2.5 w-2.5" /> No SPPU
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
                  Remarks
                </div>
                <div className="text-[13px] text-muted">{doc.user.remarks || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
