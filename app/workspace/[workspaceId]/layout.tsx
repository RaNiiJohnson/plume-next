import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { hasPermission } from "@/lib/server/permissions";
import { Bell, Users } from "lucide-react";
import { InviteButton, WorkspaceNav } from "./_components";
import { LeaveButton } from "./_components/leave-button";

type WorkspaceLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspaceId } = await params;
  const canAccessSettings = await hasPermission({ workspace: ["update"] });

  // Get organization info
  const organization = await prisma.organization.findUnique({
    where: { id: workspaceId },
    select: {
      name: true,
      _count: {
        select: {
          Board: true,
        },
      },
    },
  });

  // get members count
  const membersCount = await prisma.member.count({
    where: {
      organizationId: workspaceId,
    },
  });

  // Get pending invitations count
  const pendingInvitationsCount = await prisma.invitation.count({
    where: {
      organizationId: workspaceId,
      status: "pending",
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Organization not found</h1>
        <p className="text-muted-foreground">
          The organization you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full min-w-0 p-3">
      <div className="flex-1 flex flex-col space-y-6 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{organization.name}</h1>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {membersCount > 1 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{membersCount}</span>
                <span className="text-muted-foreground">members</span>
              </div>
            )}
            {pendingInvitationsCount > 0 && (
              <div className="flex items-center gap-1">
                <Bell className="w-4 h-4 text-orange-500" />
                <Badge variant="secondary" className="text-xs">
                  {pendingInvitationsCount} pending
                </Badge>
              </div>
            )}{" "}
            <InviteButton organizationId={workspaceId} />
            {(await hasPermission({ workspace: ["leave"] })) && (
              <LeaveButton
                organizationId={workspaceId}
                organizationName={organization.name}
              />
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <WorkspaceNav
            workspaceId={workspaceId}
            canAccessSettings={canAccessSettings}
          />
        </div>

        {/* Content area with proper overflow handling */}
        <div className="flex-1 min-h-0 min-w-0">{children}</div>
      </div>
    </div>
  );
}
