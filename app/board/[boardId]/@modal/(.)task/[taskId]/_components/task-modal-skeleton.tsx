import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function TaskModalSkeleton() {
  return (
    <div className="fixed overflow-y-auto inset-0 bg-black/60 flex items-start md:pt-5 pt-0 justify-center z-50">
      <div className="bg-background text-foreground max-md:h-full md:rounded-xl p-6 w-full max-w-6xl shadow-2xl border border-border/50 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="flex max-sm:flex-col sm:items-center sm:gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-muted rounded-full w-8 h-8 p-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description skeleton */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            {/* Comments skeleton */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                <Skeleton className="h-6 w-20" />
              </div>

              {/* Comment input skeleton */}
              <div className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </div>

              {/* Existing comments skeleton */}
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            {/* Due Date skeleton */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* Tags skeleton */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                <Skeleton className="h-5 w-12" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
