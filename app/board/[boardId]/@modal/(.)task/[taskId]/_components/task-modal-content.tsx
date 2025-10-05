import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { TaskModal } from "../TaskModal";
import { TaskModalSkeleton } from "./task-modal-skeleton";

async function TaskModalData({
  boardId,
  taskId,
  currentUserId,
  currentUserName,
  currentUserImage,
}: {
  boardId: string;
  taskId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
}) {
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

  return (
    <TaskModal
      boardId={boardId}
      task={task}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      currentUserImage={currentUserImage}
    />
  );
}

export function TaskModalContent({
  boardId,
  taskId,
  currentUserId,
  currentUserName,
  currentUserImage,
}: {
  boardId: string;
  taskId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
}) {
  return (
    <Suspense fallback={<TaskModalSkeleton />}>
      <TaskModalData
        boardId={boardId}
        taskId={taskId}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserImage={currentUserImage}
      />
    </Suspense>
  );
}
