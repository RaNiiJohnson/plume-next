import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Authpermisson } from "../types/auth-permission";

export const hasPermission = async (permissions: Authpermisson) => {
  const { success } = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions,
    },
  });

  return success;
};
