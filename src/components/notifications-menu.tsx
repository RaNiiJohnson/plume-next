import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { Bell, ChevronRight, Mail, Users } from "lucide-react";
import Link from "next/link";

export async function NotificationsMenu() {
  const session = await getSession();

  if (!session?.user?.email) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Notifications">
          <Bell />
          <span>Notifications</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Get pending invitations for the current user
  const pendingInvitations = await prisma.invitation.findMany({
    where: {
      email: session.user.email,
      status: "pending",
      expiresAt: {
        gt: new Date(), // Only non-expired invitations
      },
    },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      expiresAt: "desc",
    },
  });

  const hasNotifications = pendingInvitations.length > 0;

  return (
    <Collapsible asChild className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="Notifications" className="cursor-pointer">
            <div className="relative">
              <Bell />
              {hasNotifications && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  {pendingInvitations.length}
                </Badge>
              )}
            </div>
            <span>Notifications</span>
            {hasNotifications && (
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {hasNotifications && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {pendingInvitations.map((invitation) => (
                <SidebarMenuSubItem key={invitation.id}>
                  <SidebarMenuSubButton asChild>
                    <Link
                      href={`/invite/${invitation.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Join {invitation.organization.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Invited by {invitation.user.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {invitation.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Expires{" "}
                            {new Date(
                              invitation.expiresAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}

              {/* View all notifications link */}
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    View all notifications
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
}
