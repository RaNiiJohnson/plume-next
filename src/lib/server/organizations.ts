"use server";

import { getUser } from "../auth-server";
import prisma from "../prisma";

export const getOrganizations = async () => {
  const user = await getUser();

  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: user?.id,
          role: "owner",
        },
      },
    },
  });

  return organizations;
};
export const getSharedOrganizations = async () => {
  const user = await getUser();

  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: user?.id,
          role: {
            in: ["member", "admin"],
          },
        },
      },
    },
  });

  return organizations;
};

export const getActiveOrganization = async (userId: string) => {
  const member = await prisma.member.findFirst({
    where: {
      userId: userId,
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!member?.organization) {
    throw new Error("No organization found for this user");
  }

  return member.organization;
};
