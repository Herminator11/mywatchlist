"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Movie } from "@prisma/client";
import { DraggableMediaCard } from "./DraggableMediaCard";

const keyOf = (m: Movie) => `${m.tmdbId}_${m.listType}_${m.seasonNumber}`;

interface FavoritesListProps {
  initial: Movie[];
  onDelete: (movie: Movie) => Promise<void> | void;
  onEdit?: (movie: Movie) => void;
  onPersist: (ordered: Movie[]) => void;
}

// Sortierbare Favoriten-Liste. Lokale Reihenfolge wird beim Drop persistiert.
// Der Parent remountet via key, wenn sich die Einträge ändern (Add/Delete).
export function FavoritesList({ initial, onDelete, onEdit, onPersist }: FavoritesListProps) {
  const [items, setItems] = useState<Movie[]>(initial);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((m) => keyOf(m) === active.id);
    const newIndex = items.findIndex((m) => keyOf(m) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    onPersist(next);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(keyOf)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2.5">
          {items.map((m) => (
            <DraggableMediaCard
              key={keyOf(m)}
              id={keyOf(m)}
              movie={m}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
