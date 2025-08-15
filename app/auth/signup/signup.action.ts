"use server";

import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

async function generateUniqueOrgSlug(baseName: string) {
  const baseSlug = baseName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  return slug;
}

async function generateDefaultOrgDetails(name: string) {
  const fallback = "user";
  const baseName = name?.includes("@") ? name.split("@")[0] : name || fallback;

  const displayName = `${baseName}'s Organization`;
  const slug = await generateUniqueOrgSlug(baseName);

  return { displayName, slug };
}

export const createDefaultOrg = async (name: string) => {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("No user session found");
  }

  const userId = session.user.id;
  const { displayName, slug } = await generateDefaultOrgDetails(name);

  await auth.api.createOrganization({
    body: {
      name: displayName,
      slug,
      userId,
      keepCurrentActiveOrganization: false,
    },
    headers: await headers(),
  });
};
