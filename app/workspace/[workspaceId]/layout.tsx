import { SecondPageLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { LayoutGrid, Users, Settings, Bell } from "lucide-react";
import Link from "next/link";
import { ActiveOrgView, WorkspaceNav } from "./_components";

type WorkspaceLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspaceId } = await params;

  // Get organization info
  const organization = await prisma.organization.findUnique({
    where: { id: workspaceId },
    select: {
      name: true,
      _count: {
        select: {
          members: true,
          Board: true,
        },
      },
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
      <SecondPageLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Organization not found</h1>
          <p className="text-muted-foreground">
            The organization you're looking for doesn't exist.
          </p>
        </div>
      </SecondPageLayout>
    );
  }

  return (
    <SecondPageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{organization.name}</h1>
            <ActiveOrgView />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{organization._count.Board}</span>
              <span className="text-muted-foreground">boards</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{organization._count.members}</span>
              <span className="text-muted-foreground">members</span>
            </div>
            {pendingInvitationsCount > 0 && (
              <div className="flex items-center gap-1">
                <Bell className="w-4 h-4 text-orange-500" />
                <Badge variant="secondary" className="text-xs">
                  {pendingInvitationsCount} pending
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <WorkspaceNav workspaceId={workspaceId} />

        {/* Page Content */}
        {children}
      </div>
    </SecondPageLayout>
  );
}
