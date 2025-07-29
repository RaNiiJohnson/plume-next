import React from "react";

// Assure-toi que cette interface est la même que dans BoardView.tsx
interface Task {
  id: string;
  content: string;
  position?: number;
  columnId: string;
}

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="bg-accent border border-muted p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab">
      {task.content}
    </div>
  );
}
//   return (
//     <div
//       ref={setNodeRef}
//       {...attributes}
//       {...listeners}
//       style={style}
//       className="bg-background border border-muted p-3 rounded-lg shadow-sm hover:bg-accent cursor-pointer select-none"
//       suppressHydrationWarning
//     >
//       <span className="block text-sm font-medium">{task.content}</span>
//     </div>
//   );
// }
