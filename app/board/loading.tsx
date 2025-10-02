import { BoardHeaderSkeleton } from "./[boardId]/_components/board-header-skeleton";
import { BoardColumnsSkeleton } from "./[boardId]/_components/column-skeleton";

export default function BoardLoading() {
  return (
    <div className="h-full flex flex-col">
      {/* Header skeleton */}
      <BoardHeaderSkeleton />

      {/* Board content skeleton */}
      <div className="flex-1">
        <BoardColumnsSkeleton />
      </div>
    </div>
  );
}
