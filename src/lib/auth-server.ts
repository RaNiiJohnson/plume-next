"use server";

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { headers } from "next/headers";

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signup");
  }

  return session;
};

export const getUser = async () => {
  const session = await getSession();

  if (!session) {
    return;
  }

  return session.user;
};
