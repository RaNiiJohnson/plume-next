"use server";

import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
type InviteUserParams = {
  email: string;
  role: "member" | "admin" | "owner";
  organizationId: string;
};

export async function inviteUserAction({
  email,
  role,
  organizationId,
}: InviteUserParams) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMember = await prisma.member.findFirst({
        where: {
          userId: existingUser.id,
          organizationId: organizationId,
        },
      });

      if (existingMember) {
        return {
          success: false,
          error: "User is already a member of this organization",
        };
      }
    }

    const data = await auth.api.createInvitation({
      body: {
        email,
        role,
        organizationId,
        resend: true,
      },
      headers: await headers(),
    });

    revalidatePath(`/workspace/${organizationId}`);

    return { success: true, invitationId: data.id };
  } catch (error) {
    console.error("Error creating invitation:", error);
    return { success: false, error: "Failed to send invitation" };
  }
}

export async function cancelInvitationAction({
  invitationId,
}: {
  invitationId: string;
}) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await auth.api.cancelInvitation({
      body: {
        invitationId,
      },
      headers: await headers(),
    });

    revalidatePath(`/workspace/${result?.organizationId}`);

    return { success: true };
  } catch (error) {
    console.error("Error canceling invitation:", error);
    return { success: false, error: "Failed to cancel invitation" };
  }
}
