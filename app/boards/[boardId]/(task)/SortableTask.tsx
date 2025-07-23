// components/(task)/SortableTask.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Task {
  id: string;
  position?: number;
  content: string;
  columnId: string;
}

export default function SortableTask({ task }: { task: Task }) {
  // Add a check for task.id being valid
  if (!task.id) {
    console.error("SortableTask received a task without an ID!", task);
    return null; // Don't render if there's no ID
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id }); // This `id` must match one in SortableContext's `items` array

  // Add a log to see what useSortable is giving us
  // console.log(`SortableTask: ${task.id}`, { transform, transition, isDragging, attributes, listeners });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-background border border-muted p-3 rounded-lg shadow-sm hover:bg-accent cursor-pointer select-none"
      suppressHydrationWarning
    >
      <span className="block text-sm font-medium">{task.content}</span>
      <span className="text-xs text-muted-foreground">
        Position : {task.position}
      </span>
    </div>
  );
}
