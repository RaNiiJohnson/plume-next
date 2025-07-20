import prisma from "@/lib/prisma";
import BoardView from "./Board";
import { getUser } from "@/lib/auth-server";
import { unauthorized } from "next/navigation";

type Pageprops = {
  params: Promise<{ boardId: string }>;
};

export default async function Home(props: Pageprops) {
  const user = await getUser();
  const params = await props.params;

  const board = await prisma.board.findUnique({
    where: { id: params.boardId },
    include: {
      columns: {
        include: { tasks: true },
      },
    },
  });

  if (!user || user.id !== board?.userId) {
    return unauthorized();
  }

  return (
    <div className="h-full">
      <BoardView board={board} />
    </div>
  );
}
