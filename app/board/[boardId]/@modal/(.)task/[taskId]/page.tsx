import prisma from "@/lib/prisma";
import { TaskModal } from "./TaskModal";
import { getUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

interface TaskModalPageProps {
  params: Promise<{
    boardId: string;
    taskId: string;
  }>;
}

export default async function TaskModalPage({ params }: TaskModalPageProps) {
  const { boardId, taskId } = await params;

  const user = await getUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) {
    return <div>Task not found</div>;
  }

  return <TaskModal boardId={boardId} task={task} currentUserId={user.id} />;
}
