import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  try {
    const { workspaceId } = await params;

    const organization = await prisma.organization.findUnique({
      where: { id: workspaceId },
      include: {
        _count: {
          select: {
            members: true,
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

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error fetching organization details:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization details" },
      { status: 500 }
    );
  }
}
