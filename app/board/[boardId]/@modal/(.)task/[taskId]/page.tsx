import { getUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { TaskModalContent } from "./_components/task-modal-content";

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

  return (
    <TaskModalContent
      boardId={boardId}
      taskId={taskId}
      currentUserId={user.id}
      currentUserName={user.name}
      currentUserImage={user.image || null}
    />
  );
}
