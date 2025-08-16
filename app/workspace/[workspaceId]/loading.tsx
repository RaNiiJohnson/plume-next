import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BoardsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header avec statistiques globales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-4">
          <div className="text-center space-y-1">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Grille des boards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <BoardCardSkeleton key={i} />
        ))}

        {/* Add Board Button Skeleton */}
        <div className="relative group h-full min-h-[200px]">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BoardCardSkeleton() {
  return (
    <div className="relative group">
      <Card className="p-6 h-full min-h-[200px] space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-1">
              <Skeleton className="w-3 h-3" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Tasks summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-3 w-4" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-3 w-4" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-muted">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </Card>
    </div>
  );
}
