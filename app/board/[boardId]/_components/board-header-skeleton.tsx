import { Skeleton } from "@/components/ui/skeleton";

export function BoardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-4 md:mb-8 flex-shrink-0 px-4 md:px-6 py-4 md:py-6">
      <div className="flex items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}
