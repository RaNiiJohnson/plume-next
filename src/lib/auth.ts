import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { ac, admin, member, owner } from "./auth-permissions";
import prisma from "./prisma";

export const auth = betterAuth({
  plugins: [
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
      async sendInvitationEmail(data) {
        // Construct the invitation link
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`;

        console.log(`Sending invitation email to ${data.email}`);
        console.log(`Invitation link: ${inviteLink}`);
        console.log(
          `Invited by: ${data.inviter.user.name} (${data.inviter.user.email})`
        );
        console.log(`Organization: ${data.organization.name}`);
      },
      invitationExpiresIn: 7 * 24 * 60 * 60,
    }),
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  ].filter(Boolean),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "auth",
  },
});
