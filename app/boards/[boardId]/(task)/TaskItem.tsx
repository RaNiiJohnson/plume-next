import { Task } from "@/lib/types/type";

type TaskItemProps = {
  task: Task;
};

export default function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="bg-accent border border-muted p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab">
      {task.content}
    </div>
  );
}
