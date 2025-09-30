import prisma from "@/lib/prisma";
import BoardView from "./BoardView";
import { Board } from "@/lib/types/type";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

type Pageprops = {
  params: Promise<{ boardId: string }>;
};

export default async function Page(props: Pageprops) {
  const params = await props.params;

  const session = await getSession();
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const board = await prisma.board.findUnique({
    where: { id: params.boardId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
          },
        },
      },
      organization: {
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!board) {
    redirect("/");
  }

  // Transform the data to match the expected types
  const transformedBoard: Board = {
    id: board.id,
    title: board.title,
    userId: board.userId,
    description: board.description,
    isPublic: board.isPublic,
    createdAt: board.createdAt,
    organizationId: board.organizationId,
    organization: board.organization,
    columns: board.columns.map((column) => ({
      id: column.id,
      title: column.title,
      position: column.position,
      boardId: column.boardId,
      tasks: column.tasks.map((task) => ({
        id: task.id,
        content: task.content,
        description: task.description || undefined,
        position: task.position,
        columnId: task.columnId,
        tags: task.tags,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
      })),
    })),
  };

  return (
    <div className="h-full">
      <BoardView board={transformedBoard} />
    </div>
  );
}
