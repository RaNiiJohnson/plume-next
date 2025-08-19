"use server";

import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function acceptInvitationAction({
  invitationId,
}: {
  invitationId: string;
}) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.status !== "pending") {
      throw new Error("Invalid invitation");
    }

    if (invitation.email !== session.user.email) {
      throw new Error("Invitation email mismatch");
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error("Invitation expired");
    }

    // Check if user is already a member
    const existingMember = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: invitation.organizationId,
      },
    });

    if (existingMember) {
      // Update invitation status and redirect
      await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: "accepted" },
      });
      redirect(`/workspace/${invitation.organizationId}`);
      return;
    }

    await auth.api.acceptInvitation({
      body: {
        invitationId,
      },
      headers: await headers(),
    });

    redirect(`/workspace/${invitation.organizationId}`);
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
}

export async function declineInvitationAction({
  invitationId,
}: {
  invitationId: string;
}) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.status !== "pending") {
      throw new Error("Invalid invitation");
    }

    if (invitation.email !== session.user.email) {
      throw new Error("Invitation email mismatch");
    }
    await auth.api.rejectInvitation({
      body: {
        invitationId, // required
      },
      headers: await headers(),
    });
    redirect("/");
  } catch (error) {
    console.error("Error declining invitation:", error);
    throw error;
  }
}
