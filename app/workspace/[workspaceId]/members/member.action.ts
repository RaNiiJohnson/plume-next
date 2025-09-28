"use server";

import { Member } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const removeMember = async (member: Member) => {
  try {
    await auth.api.removeMember({
      body: {
        memberIdOrEmail: member.id,
        organizationId: member.organizationId,
      },
      headers: await headers(),
    });
    revalidatePath(`/workspace/${member.organizationId}/members`);
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to remove member.",
    };
  }
};

export const updateMember = async (
  member: Member,
  role: "member" | "admin"
) => {
  try {
    await auth.api.updateMemberRole({
      body: {
        role,
        memberId: member.id,
        organizationId: member.organizationId,
      },
      headers: await headers(),
    });
    revalidatePath(`/workspace/${member.organizationId}/members`);
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to update member.",
    };
  }
};
