import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  try {
    const { workspaceId } = await params;

    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId: workspaceId,
        status: "pending",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        expiresAt: "desc",
      },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
