import { redirect } from "next/navigation";

interface TaskPageProps {
  params: Promise<{
    boardId: string;
    taskId: string;
  }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { boardId } = await params;
  redirect(`/board/${boardId}`);
}
