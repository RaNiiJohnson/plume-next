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
  if (!task.id) {
    console.error("SortableTask received a task without an ID!", task);
    return null;
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task: task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };
  return (
    <div
      suppressHydrationWarning
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-background border border-muted p-3 rounded-lg shadow-sm hover:bg-accent cursor-pointer select-none"
    >
      <span className=" text-sm font-medium">{task.content}</span>
    </div>
  );
}
