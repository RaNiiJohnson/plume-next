"use server";

import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
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

    // Create membership and update invitation in a transaction
    await prisma.$transaction([
      prisma.member.create({
        data: {
          id: crypto.randomUUID(),
          userId: session.user.id,
          organizationId: invitation.organizationId,
          role: invitation.role || "member",
        },
      }),
      prisma.invitation.update({
        where: { id: invitationId },
        data: { status: "accepted" },
      }),
    ]);

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

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "declined" },
    });

    redirect("/");
  } catch (error) {
    console.error("Error declining invitation:", error);
    throw error;
  }
}
