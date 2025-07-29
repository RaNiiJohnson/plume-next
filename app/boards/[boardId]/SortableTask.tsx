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
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    // height: isDragging ? 0 : undefined,
    // overflow: isDragging ? "hidden" : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-background border border-muted p-3 rounded-lg shadow-sm hover:bg-accent cursor-pointer select-none"
      suppressHydrationWarning={true}
    >
      <span className=" text-sm font-medium" suppressHydrationWarning={true}>
        {task.content}
      </span>
    </div>
  );
}
