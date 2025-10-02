import { Skeleton } from "@/components/ui/skeleton";

export function BoardCardSkeleton() {
  return (
    <div className="block relative overflow-hidden rounded-sm bg-card text-card-foreground shadow-sm p-6 border border-muted h-full">
      {/* Background gradient skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40"></div>

      {/* Card content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Tasks summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-muted">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BoardsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <BoardCardSkeleton key={i} />
      ))}
    </div>
  );
}
