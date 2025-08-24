"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const leaveWorkspace = async (organizationId: string) => {
  try {
    await auth.api.leaveOrganization({
      body: {
        organizationId,
      },
      headers: await headers(),
    });
  } catch (error) {
    throw error;
  }
};
