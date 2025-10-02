"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

type BoardStatusBadgeProps = {
  totalTasks: number;
  completionRate: number;
  lastActivity: number;
};

export function BoardStatusBadge({
  totalTasks,
  completionRate,
  lastActivity,
}: BoardStatusBadgeProps) {
  const [daysSince, setDaysSince] = useState(0);

  useEffect(() => {
    const days = Math.floor(
      (Date.now() - lastActivity) / (1000 * 60 * 60 * 24)
    );
    setDaysSince(days);
  }, [lastActivity]);

  if (totalTasks === 0) {
    return (
      <Badge variant="secondary" className="text-xs">
        Empty
      </Badge>
    );
  }

  if (completionRate === 100) {
    return (
      <Badge variant="default" className="text-xs bg-green-600">
        Complete
      </Badge>
    );
  }

  if (daysSince === 0) {
    return (
      <Badge variant="default" className="text-xs bg-blue-600">
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs">
      In Progress
    </Badge>
  );
}
