import prisma from "@/lib/prisma";
import BoardView from "./BoardView";
import { getUser } from "@/lib/auth-server";
import { unauthorized } from "next/navigation";

type Pageprops = {
  params: Promise<{ boardId: string }>;
};

export default async function Page(props: Pageprops) {
  const user = await getUser();
  const params = await props.params;

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
    },
  });

  if (!user || user.id !== board?.userId) {
    return unauthorized();
  }

  if (!board) {
    return <div>Board not found.</div>;
  }

  return (
    <div className="h-screen">
      <BoardView board={board} />
    </div>
  );
}
