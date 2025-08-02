import { Task } from "@/lib/types/type";

type TaskOverlayProps = {
  task: Task;
  width?: number;
};

export default function TaskOverlay({ task, width }: TaskOverlayProps) {
  return (
    <div
      className="bg-background border border-muted p-3 dark:hover:bg-muted rounded-lg shadow-sm hover:bg-accent cursor-grabbing select-none"
      style={width ? { width } : undefined}
    >
      {task.content}
    </div>
  );
}
