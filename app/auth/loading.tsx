import { Skeleton } from "@/components/ui/skeleton";

export default function loading() {
  return (
    <div className="max-w-md mx-auto mt-20 p-4">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-1/2 rounded-md mx-auto" />
      </div>
    </div>
  );
}
