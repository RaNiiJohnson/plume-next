"use client";

import { LayoutGrid, Users, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type WorkspaceNavProps = {
  workspaceId: string;
};

export function WorkspaceNav({ workspaceId }: WorkspaceNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/workspace/${workspaceId}/boards`,
      label: "Boards",
      icon: LayoutGrid,
      isActive:
        pathname === `/workspace/${workspaceId}/boards` ||
        pathname === `/workspace/${workspaceId}`,
    },
    {
      href: `/workspace/${workspaceId}/members`,
      label: "Members",
      icon: Users,
      isActive: pathname === `/workspace/${workspaceId}/members`,
    },
    {
      href: `/workspace/${workspaceId}/settings`,
      label: "Settings",
      icon: Settings,
      isActive: pathname === `/workspace/${workspaceId}/settings`,
    },
  ];

  return (
    <nav className="flex space-x-8 border-b">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 py-2 px-1 border-b-2 transition-colors",
              item.isActive
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
