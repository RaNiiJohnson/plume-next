import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SecondPageLayout } from "@/components/layout";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Mail,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get all invitations for the current user
  const invitations = await prisma.invitation.findMany({
    where: {
      email: session.user.email,
    },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
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

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending" && inv.expiresAt > new Date()
  );
  const expiredInvitations = invitations.filter(
    (inv) => inv.status === "pending" && inv.expiresAt <= new Date()
  );
  const processedInvitations = invitations.filter(
    (inv) => inv.status !== "pending"
  );

  const getStatusIcon = (status: string, expired: boolean) => {
    if (expired) return <XCircle className="w-4 h-4 text-destructive" />;
    if (status === "accepted")
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === "declined")
      return <XCircle className="w-4 h-4 text-red-600" />;
    return <Mail className="w-4 h-4 text-primary" />;
  };

  const getStatusText = (status: string, expired: boolean) => {
    if (expired) return "Expired";
    if (status === "accepted") return "Accepted";
    if (status === "declined") return "Declined";
    return "Pending";
  };

  const getStatusVariant = (status: string, expired: boolean) => {
    if (expired) return "destructive";
    if (status === "accepted") return "default";
    if (status === "declined") return "secondary";
    return "outline";
  };

  return (
    <SecondPageLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Pending Invitations
              </CardTitle>
              <CardDescription>
                {pendingInvitations.length} invitation
                {pendingInvitations.length === 1 ? "" : "s"} waiting for your
                response
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        Join {invitation.organization.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Invited by {invitation.user.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {invitation.role}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Expires{" "}
                            {new Date(
                              invitation.expiresAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/invite/${invitation.id}`}>
                      View Invitation
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {(expiredInvitations.length > 0 || processedInvitations.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your invitation history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...expiredInvitations, ...processedInvitations].map(
                (invitation) => {
                  const expired =
                    invitation.status === "pending" &&
                    invitation.expiresAt <= new Date();
                  return (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {getStatusIcon(invitation.status, expired)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {invitation.organization.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Invited by {invitation.user.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusVariant(invitation.status, expired)}
                          className="text-xs"
                        >
                          {getStatusText(invitation.status, expired)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {invitations.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You don't have any notifications at the moment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </SecondPageLayout>
  );
}
