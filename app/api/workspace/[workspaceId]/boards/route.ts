import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  try {
    const { workspaceId } = await params;

    const boards = await prisma.board.findMany({
      where: {
        organizationId: workspaceId,
      },
      include: {
        columns: {
          include: {
            _count: {
              select: {
                tasks: true,
              },
            },
            tasks: {
              select: {
                id: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}
