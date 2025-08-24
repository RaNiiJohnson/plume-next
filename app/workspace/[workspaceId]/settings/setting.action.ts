"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface UpdateWorkspaceParams {
  name: string;
  slug: string;
  logo?: string;
  workspaceId: string;
}

export const updateWorkspace = async ({
  name,
  slug,
  logo,
  workspaceId,
}: UpdateWorkspaceParams) => {
  try {
    const data = await auth.api.updateOrganization({
      body: {
        data: {
          name,
          slug,
          logo,
        },
        organizationId: workspaceId,
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to update workspace:", error);
    return { success: false, error: "Failed to update workspace" };
  }
};
