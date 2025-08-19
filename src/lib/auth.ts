import { getActiveOrganization } from "./server/organizations";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        // Construct the invitation link
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`;

        console.log(`Sending invitation email to ${data.email}`);
        console.log(`Invitation link: ${inviteLink}`);
        console.log(
          `Invited by: ${data.inviter.user.name} (${data.inviter.user.email})`
        );
        console.log(`Organization: ${data.organization.name}`);

        // await sendEmail({
        //   to: data.email,
        //   subject: `You're invited to join ${data.organization.name}`,
        //   html: `
        //     <h2>You've been invited to join ${data.organization.name}</h2>
        //     <p>${data.inviter.user.name} has invited you to join their organization.</p>
        //     <a href="${inviteLink}">Accept Invitation</a>
        //   `
        // });
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
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      scopes: ["email", "public_profile"],
    },
  },
});
