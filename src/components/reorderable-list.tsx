"use client";

import { useRef, useState, useTransition } from "react";
import { GripVertical } from "lucide-react";

type ReorderableItem = { id: string; content: React.ReactNode };

export function ReorderableList({
  items,
  reorderAction,
}: {
  items: ReorderableItem[];
  reorderAction: (orderedIds: string[]) => Promise<void>;
}) {
  const [prevItems, setPrevItems] = useState(items);
  const [order, setOrder] = useState(items);
  const dragId = useRef<string | null>(null);
  const [, startTransition] = useTransition();

  if (items !== prevItems) {
    setPrevItems(items);
    setOrder(items);
  }

  function persist(nextOrder: ReorderableItem[]) {
    dragId.current = null;
    startTransition(() => {
      reorderAction(nextOrder.map((item) => item.id));
    });
  }

  return (
    <div className="flex flex-col">
      {order.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => {
            dragId.current = item.id;
          }}
          onDragOver={(e) => {
            e.preventDefault();
            const draggedId = dragId.current;
            if (!draggedId || draggedId === item.id) return;
            setOrder((prev) => {
              const from = prev.findIndex((i) => i.id === draggedId);
              const to = prev.findIndex((i) => i.id === item.id);
              if (from === -1 || to === -1 || from === to) return prev;
              const next = [...prev];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
              return next;
            });
          }}
          onDragEnd={() => persist(order)}
          className="flex items-center gap-3 border-b border-hairline-soft py-3 last:border-b-0"
        >
          <GripVertical className="h-4 w-4 flex-none cursor-grab text-muted-soft active:cursor-grabbing" />
          <div className="min-w-0 flex-1">{item.content}</div>
        </div>
      ))}
    </div>
  );
}
