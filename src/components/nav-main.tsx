import { Bell, ChevronRight, Contrast, Layers } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { getOrganizations } from "@/lib/server/organizations";
import { WorkspaceLinksSidebar } from "@app/Workspace.link";
import { ThemeToggleDark, ThemeToggleLight } from "./theme-toggle";

export async function NavMain() {
  const organizations = await getOrganizations();
  return (
    <SidebarGroup>
      <SidebarGroupLabel> Dashboard</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible asChild defaultOpen={true} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Workspaces">
                <Layers />
                <span>Workspaces</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {organizations?.map((organization) => (
                  <WorkspaceLinksSidebar
                    key={organization.id}
                    organization={organization}
                  />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>

      <SidebarMenu>
        <Collapsible asChild className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip="Appearance"
                className="cursor-pointer"
              >
                <Contrast />
                <span>Appearance</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <ThemeToggleLight />
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <ThemeToggleDark />
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
      <SidebarMenuButton tooltip="Notifications">
        <Bell />
        <span>Notifications</span>
      </SidebarMenuButton>
    </SidebarGroup>
  );
}
