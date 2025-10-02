"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getActivityText } from "../_lib/board-utils";

type ActivityTimeProps = {
  lastActivity: number;
};

export function ActivityTime({ lastActivity }: ActivityTimeProps) {
  const [daysSince, setDaysSince] = useState(0);

  useEffect(() => {
    const days = Math.floor(
      (Date.now() - lastActivity) / (1000 * 60 * 60 * 24)
    );
    setDaysSince(days);
  }, [lastActivity]);

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Clock className="w-3 h-3" />
      <span>Updated {getActivityText(daysSince)}</span>
    </div>
  );
}
