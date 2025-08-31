import { ChevronRight, Contrast, Folder, FolderTree } from "lucide-react";

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
import {
  getOrganizations,
  getSharedOrganizations,
} from "@/lib/server/organizations";
import { WorkspaceLinksSidebar } from "@/components/Workspace.link";
import { ThemeToggleDark, ThemeToggleLight } from "./theme-toggle";
import { NotificationsMenu } from "./notifications-menu";

export async function NavMain() {
  const organizations = await getOrganizations();
  const sharedOrganizations = await getSharedOrganizations();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plume</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible asChild defaultOpen={true} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Workspaces">
                <Folder />
                <span>My workspaces</span>
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
      {sharedOrganizations.length > 0 && (
        <SidebarMenu>
          <Collapsible asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip="Workspaces">
                  <FolderTree />
                  <span>Joined workspaces</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {sharedOrganizations.map((organization) => (
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
      )}

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

      <SidebarMenu>
        <NotificationsMenu />
      </SidebarMenu>
    </SidebarGroup>
  );
}
