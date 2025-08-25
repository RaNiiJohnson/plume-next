import { hasPermission } from "@/lib/server/permissions";
import { NextResponse } from "next/server";

export async function GET({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  try {
    const { workspaceId } = await params;

    // Check various permissions that might be needed
    const permissions = {
      canDeleteWorkspace: await hasPermission({ workspace: ["delete"] }),
      canInviteMembers: await hasPermission({ workspace: ["invite"] }),
      // Add more permissions as needed
    };

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
