"use server";

import { auth } from "@/lib/auth";
import { getUser } from "@/lib/auth-server";
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

  const displayName = `${baseName}'s workspace`;
  const slug = await generateUniqueOrgSlug(baseName);

  return { displayName, slug };
}

export const createDefaultOrg = async () => {
  const user = await getUser();
  if (!user?.id) throw new Error("No user session found");

  const existingMembership = await prisma.member.findFirst({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
  });

  if (existingMembership) {
    console.log("no creation necessary");
    return existingMembership.organization;
  }

  const { displayName, slug } = await generateDefaultOrgDetails(user.name);

  const org = await auth.api.createOrganization({
    body: {
      name: displayName,
      slug,
      userId: user.id,
      keepCurrentActiveOrganization: false,
    },
    headers: await headers(),
  });

  console.log("Organization created:", org);
  return org;
};
