import prisma from "@/lib/prisma";
import { Users } from "lucide-react";
import { BoardCard, AddBoardButton } from "./_components";
import { calculateBoardsStats } from "./_lib/board-utils";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

type BoardsPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function BoardsPage(props: BoardsPageProps) {
  const params = await props.params;

  const session = await getSession();
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const boards = await prisma.board.findMany({
    where: {
      organizationId: params.workspaceId,
    },
    include: {
      columns: {
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
          tasks: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const stats = calculateBoardsStats(boards);

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="flex items-center gap-8 text-sm text-muted-foreground">
        {stats.map((stat) => (
          <div key={stat.title} className="flex items-center gap-2">
            <span>{stat.title}:</span>
            <span className="font-semibold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards?.map((board, index) => (
          <BoardCard
            key={board.id}
            board={board}
            index={index}
            workspaceId={params.workspaceId}
          />
        ))}
        <AddBoardButton organizationId={params.workspaceId} />
      </div>

      {/* Empty State */}
      {boards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first board to start organizing your projects
          </p>
        </div>
      )}
    </div>
  );
}
