import prisma from "@/lib/prisma";
import { TaskModal } from "./TaskModal";

interface TaskModalPageProps {
  params: Promise<{
    boardId: string;
    taskId: string;
  }>;
}

export default async function TaskModalPage({ params }: TaskModalPageProps) {
  const { boardId, taskId } = await params;

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    return <div>Task not found</div>;
  }

  return <TaskModal boardId={boardId} task={task} />;
}
