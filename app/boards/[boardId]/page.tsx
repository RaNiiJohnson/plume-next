import prisma from "@/lib/prisma";
import BoardView from "./Board";

type Pageprops = {
  params: Promise<{ boardId: string }>;
};

export default async function Home(props: Pageprops) {
  const params = await props.params;

  const boards = await prisma.board.findMany({
    where: {
      id: params.boardId,
    },
    include: {
      columns: {
        include: {
          tasks: true,
        },
      },
    },
  });

  return (
    <div className="h-full">
      {boards.map((board) => (
        <BoardView key={board.id} board={board} />
      ))}
    </div>
  );
}
