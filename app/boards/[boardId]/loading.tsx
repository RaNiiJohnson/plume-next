import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Kanban } from "lucide-react";

export default function ColumnSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
          <Skeleton className="w-30 h-10" />
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary shadow w-9 h-9">
          <Kanban size={22} strokeWidth={2.2} />
        </span>
      </div>
      <div className="flex flex-row gap-4">
        <div className="bg-card border-2 border-muted rounded-xl w-[350px] flex flex-col shadow-sm flex-shrink-0">
          {/* Header */}
          <div className="bg-muted/30 border-b border-muted rounded-t-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="w-7 h-7 rounded-md" />
                <Skeleton className="w-7 h-7 rounded-md" />
              </div>
            </div>
          </div>

          {/* Tasks area */}
          <div className="flex-1 p-3 space-y-3 min-h-[300px]">
            {Array.from({ length: 2 }).map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>

          {/* Add task button */}
          <div className="px-3 pb-3">
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
        <div className="bg-card border-2 border-muted rounded-xl w-[350px] flex flex-col shadow-sm flex-shrink-0">
          {/* Header */}
          <div className="bg-muted/30 border-b border-muted rounded-t-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="w-7 h-7 rounded-md" />
                <Skeleton className="w-7 h-7 rounded-md" />
              </div>
            </div>
          </div>

          {/* Tasks area */}
          <div className="flex-1 p-3 space-y-3 min-h-[300px]">
            {Array.from({ length: 2 }).map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>

          {/* Add task button */}
          <div className="px-3 pb-3">
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>{" "}
        <div className="bg-card border-2 border-muted rounded-xl w-[350px] flex flex-col shadow-sm flex-shrink-0">
          {/* Header */}
          <div className="bg-muted/30 border-b border-muted rounded-t-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="w-7 h-7 rounded-md" />
                <Skeleton className="w-7 h-7 rounded-md" />
              </div>
            </div>
          </div>

          {/* Tasks area */}
          <div className="flex-1 p-3 space-y-3 min-h-[300px]">
            {Array.from({ length: 2 }).map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>

          {/* Add task button */}
          <div className="px-3 pb-3">
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </>
  );
}

// ===== TASK SKELETON =====
export function TaskSkeleton() {
  return (
    <Card className="p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="w-6 h-6 rounded-md flex-shrink-0" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1">
          <Skeleton className="w-3 h-3" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="w-6 h-6 rounded-md" />
      </div>
    </Card>
  );
}
