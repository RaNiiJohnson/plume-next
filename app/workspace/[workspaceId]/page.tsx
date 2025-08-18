import { SecondPageLayout } from "@/components/layout";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { getOrganizations } from "@/lib/server/organizations";
import { CheckCircle2, Circle, Clock, Trash2, Users } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { AddBoardButton } from "./addBoardButton";
import { deleteBoardAction } from "./board.action";
import { ActiveOrgView } from "./orgActiveView";
import { InviteButton } from "./inviteButton";
import { InvitationsList } from "./invitationsList";

type Pageprops = {
  params: Promise<{ workspaceId: string }>;
};

export default async function OrgBoardsPage(props: Pageprops) {
  const params = await props.params;
  const session = await getSession();
  const organizations = await getOrganizations();

  // let activeOrganizationId = session.session.activeOrganizationId;

  // if (!activeOrganizationId && organizations.length > 0) {
  //   activeOrganizationId = organizations[0].id;

  //   prisma.session
  //     .update({
  //       where: { id: session.session.id },
  //       data: { activeOrganizationId: organizations[0].id },
  //     })
  //     .catch(console.error);
  // }
  const boards = await prisma.board.findMany({
    where: {
      userId: session.user.id,
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

  // Fonction pour calculer les stats d'un board
  const getBoardStats = (board: any) => {
    // Compter toutes les tâches dans toutes les colonnes
    const totalTasks = board.columns.reduce(
      (acc: number, column: any) => acc + column._count.tasks,
      0
    );

    // Pour la démo, considérons que les tâches dans la dernière colonne sont "complétées"
    const lastColumn = board.columns[board.columns.length - 1];
    const completedTasks = lastColumn ? lastColumn._count.tasks : 0;

    const pendingTasks = totalTasks - completedTasks;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculer la dernière activité (dernière tâche créée)
    let lastActivity = new Date(board.createdAt).getTime();

    board.columns.forEach((column: any) => {
      column.tasks.forEach((task: any) => {
        const taskTime = new Date(task.createdAt).getTime();
        if (taskTime > lastActivity) {
          lastActivity = taskTime;
        }
      });
    });

    const daysSinceActivity = Math.floor(
      (Date.now() - lastActivity) / (1000 * 60 * 60 * 24)
    );

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      daysSinceActivity,
    };
  };

  const getActivityText = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 50) return "bg-yellow-500";
    if (rate >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <SecondPageLayout>
      <div className="flex flex-col min-h-full space-y-6">
        {/* Header avec statistiques globales */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold">
              My Boards
              {/* <OrganizationSwitcher organizations={organizations} /> */}
              <ActiveOrgView />
            </h1>
            <p className="text-muted-foreground">
              {boards.length} active{" "}
              {boards.length === 1 ? "project" : "projects"}
            </p>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">
                {boards.reduce(
                  (acc, board) => acc + getBoardStats(board).totalTasks,
                  0
                )}
              </div>
              <div className="text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {boards.reduce(
                  (acc, board) => acc + getBoardStats(board).completedTasks,
                  0
                )}
              </div>
              <div className="text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>

        {/* Pending Invitations */}
        <InvitationsList organizationId={params.workspaceId} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards?.map((board) => {
            const stats = getBoardStats(board);
            return (
              <div key={board.id} className="relative group">
                {/* Bouton delete */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Dialog>
                    <DialogTrigger>
                      <div
                        className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-muted shadow hover:bg-red-50 hover:border-red-200 text-muted-foreground hover:text-destructive transition"
                        title="Delete board"
                      >
                        <Trash2 className="w-4 h-4" />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Are you sure to delete this board{" "}
                          <span className="text-primary">{board.title}?</span>
                        </DialogTitle>

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <form>
                            <Button
                              variant="destructive"
                              formAction={async () => {
                                "use server";
                                await deleteBoardAction({ boardId: board.id });
                                revalidatePath("");
                              }}
                            >
                              Delete
                            </Button>
                          </form>
                        </DialogFooter>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Card du board */}
                <Link
                  href={`/boards/${board.id}`}
                  className="block rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-muted hover:border-primary/20 hover:bg-card/80 group h-full"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary text-lg font-bold group-hover:bg-primary group-hover:text-primary-foreground transition">
                      {board.title[0].toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition truncate">
                        {board.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          Updated {getActivityText(stats.daysSinceActivity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="space-y-3">
                    {/* Progress bar */}
                    {stats.totalTasks > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">
                            {stats.completionRate}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getProgressColor(
                              stats.completionRate
                            )}`}
                            style={{ width: `${stats.completionRate}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tasks summary */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>{stats.completedTasks}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Circle className="w-4 h-4 text-muted-foreground" />
                          <span>{stats.pendingTasks}</span>
                        </div>
                      </div>

                      {stats.totalTasks === 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          Empty
                        </Badge>
                      ) : stats.completionRate === 100 ? (
                        <Badge
                          variant="default"
                          className="text-xs bg-green-600"
                        >
                          Complete
                        </Badge>
                      ) : stats.daysSinceActivity === 0 ? (
                        <Badge
                          variant="default"
                          className="text-xs bg-blue-600"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-muted">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {stats.totalTasks}{" "}
                        {stats.totalTasks === 1 ? "task" : "tasks"}
                      </span>
                      <span className="text-primary font-medium group-hover:underline">
                        Open board →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}

          <AddBoardButton organizationId={params.workspaceId} />
        </div>

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

        <div className="flex-1"></div>

        <div className="flex justify-center pt-8 pb-4 mt-auto">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 shadow-sm">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">
                Invite Team Members
              </h3>
              <p className="text-sm text-muted-foreground">
                Collaborate with your team by inviting them to this workspace
              </p>
            </div>
            <InviteButton organizationId={params.workspaceId} />
          </div>
        </div>
      </div>
    </SecondPageLayout>
  );
}
