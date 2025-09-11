"use client";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type WorkspaceNavProps = {
  workspaceId: string;
  canAccessSettings: boolean;
};

export function WorkspaceNav({
  workspaceId,
  canAccessSettings,
}: WorkspaceNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Boards",
      icon: LayoutGrid,
      href: `/workspace/${workspaceId}`,
    },
    {
      label: "Members",
      icon: Users,
      href: `/workspace/${workspaceId}/members`,
    },
    ...(canAccessSettings
      ? [
          {
            label: "Settings",
            icon: Settings,
            href: `/workspace/${workspaceId}/settings`,
          },
        ]
      : []),
  ];

  return (
    <nav className="flex space-x-8 border-b">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 py-2 px-1 border-b-2 transition-colors",
              isActive
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
