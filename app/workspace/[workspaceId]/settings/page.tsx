import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { hasPermission } from "@/lib/server/permissions";
import { redirect } from "next/navigation";
import EditWorkspace from "./edit-workspace";

type SettingsPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { workspaceId } = await params;

  // Check if user has permission to access settings
  const canAccessSettings = await hasPermission({ workspace: ["update"] });

  if (!canAccessSettings) {
    redirect(`/workspace/${workspaceId}`);
  }

  const currentUser = await getUser();

  const organization = await prisma.organization.findUnique({
    where: { id: workspaceId },
    include: {
      _count: {
        select: {
          members: true,
          Board: true,
        },
      },
    },
  });

  const members = await prisma.member.findMany({
    where: {
      organizationId: organization?.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [
      { role: "asc" }, // Show admins first
      { createdAt: "asc" }, // Then by join date
    ],
  });

  // Get current user's role in this workspace
  const currentUserMember = members.find((m) => m.user.id === currentUser?.id);
  const currentUserRole = currentUserMember?.role;

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">workspace not found</h1>
        <p className="text-muted-foreground">
          The workspace you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* workspace Details */}

      {(await hasPermission({ workspace: ["update"] })) && (
        <EditWorkspace organization={organization} />
      )}

      {/* Danger Zone */}
      {currentUserRole === "owner" &&
        (await hasPermission({ workspace: ["delete"] })) && (
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <div>
                  <h4 className="font-medium text-destructive">
                    Delete workspace
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this workspace and all its data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
