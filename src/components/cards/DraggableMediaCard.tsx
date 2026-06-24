"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Movie } from "@prisma/client";
import { MediaCard } from "./MediaCard";

interface DraggableMediaCardProps {
  id: string;
  movie: Movie;
  onDelete?: (movie: Movie) => Promise<void> | void;
  onEdit?: (movie: Movie) => void;
  onSelect?: (movie: Movie) => void;
}

// MediaCard mit Drag-Griff für die Favoriten-Sortierung (dnd-kit).
export function DraggableMediaCard({ id, movie, onDelete, onEdit, onSelect }: DraggableMediaCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Ziehen zum Sortieren"
        className="shrink-0 cursor-grab touch-none rounded-md p-1.5 active:cursor-grabbing"
        style={{ color: "var(--text-muted)" }}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <div className="min-w-0 flex-1">
        <MediaCard
          movie={movie}
          onDelete={onDelete}
          onEdit={onEdit}
          onSelect={onSelect}
          extraMeta={movie.favoriteCategory ?? undefined}
        />
      </div>
    </div>
  );
}
