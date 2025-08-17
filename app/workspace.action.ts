"use server";

import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export const setActiveWspace = async (organizationId: string) => {
  const session = await getSession();
  await prisma.session.update({
    where: { id: session.session.id },
    data: { activeOrganizationId: organizationId },
  });
};
