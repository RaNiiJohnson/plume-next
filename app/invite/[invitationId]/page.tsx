import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import {
  acceptInvitationAction,
  declineInvitationAction,
} from "./invitation.action";

type PageProps = {
  params: Promise<{ invitationId: string }>;
};

export default async function InvitationPage(props: PageProps) {
  const params = await props.params;
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: params.invitationId },
    include: {
      organization: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Invitation Not Found
            </CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (invitation.status !== "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Invitation Already Processed
            </CardTitle>
            <CardDescription>
              This invitation has already been {invitation.status}.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Invitation Expired
            </CardTitle>
            <CardDescription>
              This invitation has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (invitation.email !== session.user.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              This invitation was sent to {invitation.email}, but you're signed
              in as {session.user.email}.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Organization</CardTitle>
          <CardDescription>
            You've been invited to join{" "}
            <strong>{invitation.organization.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Invited by</p>
            <p className="font-medium">{invitation.user.name}</p>
            <p className="text-sm text-muted-foreground">
              {invitation.user.email}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Your role will be</p>
            <p className="font-medium capitalize">{invitation.role}</p>
          </div>

          <div className="flex gap-3">
            <form className="flex-1">
              <Button
                className="w-full"
                formAction={async () => {
                  "use server";
                  await acceptInvitationAction({ invitationId: invitation.id });
                }}
              >
                Accept Invitation
              </Button>
            </form>
            <form className="flex-1">
              <Button
                variant="outline"
                className="w-full"
                formAction={async () => {
                  "use server";
                  await declineInvitationAction({
                    invitationId: invitation.id,
                  });
                }}
              >
                Decline
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
