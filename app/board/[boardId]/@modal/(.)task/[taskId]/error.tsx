"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TaskModalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) router.back();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-background text-foreground rounded-xl p-6 w-full max-w-md shadow-2xl border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-semibold">Error Loading Task</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-muted rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We encountered an error while loading the task details. Please try
            again.
          </p>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => router.back()}>
              Close
            </Button>
            <Button onClick={reset}>Try Again</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
