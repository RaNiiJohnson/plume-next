import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  try {
    const { workspaceId } = await params;

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

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get members count
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

    return NextResponse.json({
      organization,
      membersCount,
      pendingInvitationsCount,
    });
  } catch (error) {
    console.error("Error fetching workspace stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace stats" },
      { status: 500 }
    );
  }
}
