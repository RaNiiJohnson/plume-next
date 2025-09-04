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
import { CheckCircle2, Circle, Clock, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { deleteBoardAction } from "../_actions";
import {
  getBoardStats,
  getActivityText,
  getProgressColor,
  getBoardColor,
} from "../_lib/board-utils";

type BoardCardProps = {
  board: any;
  index: number;
  workspaceId: string;
};

export function BoardCard({ board, index }: BoardCardProps) {
  const stats = getBoardStats(board);
  const colorTheme = getBoardColor(index);

  return (
    <div className="group relative">
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

      {/* Board Card with varied background color */}
      <Link
        href={`/board/${board.id}`}
        className="block relative overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-muted hover:border-primary/20 hover:bg-card/80 group h-full"
      >
        {/* Background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorTheme.gradient}`}
        ></div>

        {/* Card content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorTheme.iconBg} ${colorTheme.iconColor} text-lg font-bold ${colorTheme.hoverIconBg} ${colorTheme.hoverIconColor} transition`}
            >
              {board.title[0].toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold group-hover:text-primary transition truncate">
                {board.title}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Updated {getActivityText(stats.daysSinceActivity)}</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-3">
            {/* Progress bar */}
            {stats.totalTasks > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{stats.completionRate}%</span>
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
                <Badge variant="default" className="text-xs bg-green-600">
                  Complete
                </Badge>
              ) : stats.daysSinceActivity === 0 ? (
                <Badge variant="default" className="text-xs bg-blue-600">
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
                {stats.totalTasks} {stats.totalTasks === 1 ? "task" : "tasks"}
              </span>
              <span className="text-primary font-medium group-hover:underline">
                Open board →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
