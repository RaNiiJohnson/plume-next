"use client";

import { ArrowRight } from "lucide-react";
import { setActiveWspace } from "../../app/workspace.action";
import {
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Button } from "./ui/button";

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
    <Button
      key={organization.id}
      asChild
      variant="outline"
      className="justify-between h-12 px-4"
      onClick={() => setActiveWspace(organization.id)}
    >
      <Link href={`/workspace/${organization.id}`}>
        <span className="font-medium">{organization.name}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
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
          href={`/workspace/${organization.id}/`}
          onClick={() => setActiveWspace(organization.id)}
        >
          <span>{organization.name}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
