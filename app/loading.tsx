import { Skeleton } from "@/components/ui/skeleton";

export default function HomePageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-12">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Skeleton className="w-16 h-16 rounded-lg" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-5 w-full max-w-lg" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-xl" />
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-background"
                />
              ))}
              <Skeleton className="w-10 h-10 rounded-full border-2 border-background" />
            </div>
          </div>
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Call to action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-11 w-40" />
          <Skeleton className="h-11 w-44" />
        </div>

        {/* Testimonials */}
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-muted/20 border-l-4 border-muted space-y-3"
          >
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
