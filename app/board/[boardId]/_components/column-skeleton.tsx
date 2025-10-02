import { Skeleton } from "@/components/ui/skeleton";

export function TaskSkeleton() {
  return (
    <div className="bg-card border border-muted rounded-lg p-3 shadow-sm">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-3 w-3/4 mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

export function ColumnSkeleton() {
  return (
    <div className="bg-muted/30 rounded-lg p-4 w-80 flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>

      {/* Add task button */}
      <Skeleton className="h-10 w-full mt-4 rounded-lg" />
    </div>
  );
}

export function BoardColumnsSkeleton() {
  return (
    <div className="flex gap-4 md:gap-8 items-start overflow-x-auto custom-scrollbar h-full pb-4 px-4 md:px-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <ColumnSkeleton key={i} />
      ))}
      {/* Add column button skeleton */}
      <div className="w-80 flex-shrink-0">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
