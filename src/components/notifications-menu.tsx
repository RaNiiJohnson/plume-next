import { Badge } from "@/components/ui/badge";
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
            {!hasNotifications ? (
              <Link
                href="/notifications"
                className="flex items-center gap-2 w-full"
              >
                <div className="relative">
                  <Bell size={20} />
                </div>
                <span>Notifications</span>
              </Link>
            ) : (
              <>
                <div className="relative">
                  <Bell size={20} />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {pendingInvitations.length}
                  </Badge>
                </div>
                <span>Notifications</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </>
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
                      className="flex items-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-primary"
                    >
                      <Users className="w-4 h-4" />
                      You've been invited...
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
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
