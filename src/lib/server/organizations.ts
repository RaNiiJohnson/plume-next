"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { getUser } from "../auth-server";
import prisma from "../prisma";

export const getOrganizations = async () => {
  const user = await getUser();

  const org = auth.api.getFullOrganization({
    query: {
      organizationId: "org-id",
      organizationSlug: "org-slug",
    },
    headers: await headers(),
  });

  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: user?.id,
        },
      },
    },
  });

  return organizations;
};
