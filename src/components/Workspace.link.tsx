"use client";

import { LampDesk } from "lucide-react";
import { setActiveWspace } from "../../app/workspace.action";
import {
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import Link from "next/link";

type Organization = {
  id: string;
  name: string;
};

export function WorkspaceLinks({
  organization,
}: {
  organization: Organization;
}) {
  return (
    <Link
      href={`/workspace/${organization.id}/boards`}
      onClick={() => setActiveWspace(organization.id)}
      className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <LampDesk className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium group-hover:text-primary transition-colors">
            {organization.name}
          </h4>
          <p className="text-sm text-muted-foreground">Click to view boards</p>
        </div>
      </div>
    </Link>
  );
}

export function WorkspaceLinksSidebar({
  organization,
}: {
  organization: Organization;
}) {
  return (
    <SidebarMenuSubItem key={organization.id} className="cursor-pointer">
      <SidebarMenuSubButton asChild>
        <Link
          href={`/workspace/${organization.id}/boards`}
          onClick={() => setActiveWspace(organization.id)}
        >
          <span>{organization.name}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
