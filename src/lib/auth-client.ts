import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const { signIn, signUp, signOut, useSession } = createAuthClient();

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});
