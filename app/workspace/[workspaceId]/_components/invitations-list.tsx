import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Mail, X } from "lucide-react";
import { cancelInvitationAction } from "../_actions";

type InvitationsListProps = {
  organizationId: string;
};

export async function InvitationsList({
  organizationId,
}: InvitationsListProps) {
  const invitations = await prisma.invitation.findMany({
    where: {
      organizationId,
      status: "pending",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      expiresAt: "desc",
    },
  });

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Pending Invitations
        </CardTitle>
        <CardDescription>
          {invitations.length} invitation{invitations.length === 1 ? "" : "s"}{" "}
          waiting for response
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{invitation.email}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Invited by {invitation.user.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {invitation.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <form>
                <Button
                  variant="ghost"
                  size="sm"
                  formAction={async () => {
                    "use server";
                    await cancelInvitationAction({
                      invitationId: invitation.id,
                    });
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
