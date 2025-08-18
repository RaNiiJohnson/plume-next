"use server";

import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type InviteUserParams = {
  email: string;
  role: string;
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

    // Check if user is a member of the organization and has permission to invite
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: organizationId,
      },
    });

    if (!membership) {
      return {
        success: false,
        error: "You don't have permission to invite users to this organization",
      };
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

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        organizationId,
        status: "pending",
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        error: "An invitation has already been sent to this email",
      };
    }

    // Create the invitation
    const invitation = await prisma.invitation.create({
      data: {
        id: crypto.randomUUID(),
        email,
        role,
        organizationId,
        inviterId: session.user.id,
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    // Here you would typically send an email notification
    // For now, we'll just return success

    revalidatePath(`/workspace/${organizationId}`);

    return { success: true, invitationId: invitation.id };
  } catch (error) {
    console.error("Error creating invitation:", error);
    return { success: false, error: "Failed to create invitation" };
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

    // Find the invitation and check permissions
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found" };
    }

    // Check if user has permission (is a member of the organization or is the inviter)
    const isMember = invitation.organization.members.length > 0;
    const isInviter = invitation.inviterId === session.user.id;

    if (!isMember && !isInviter) {
      return {
        success: false,
        error: "You don't have permission to cancel this invitation",
      };
    }

    // Delete the invitation
    await prisma.invitation.delete({
      where: { id: invitationId },
    });

    revalidatePath(`/workspace/${invitation.organizationId}`);

    return { success: true };
  } catch (error) {
    console.error("Error canceling invitation:", error);
    return { success: false, error: "Failed to cancel invitation" };
  }
}
