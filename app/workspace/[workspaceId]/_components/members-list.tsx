import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth-server";
import { formatDate } from "@/lib/form-date";
import prisma from "@/lib/prisma";
import { hasPermission } from "@/lib/server/permissions";
import { Users } from "lucide-react";
import { getInitials, getRoleIcon, getRoleVariant } from "../_lib/member-utils";
import MemberSelect from "./member-select";
import { RemoveMemberDialog } from "./remove-member-dialog";

type MembersListProps = {
  organizationId: string;
};

export async function MembersList({ organizationId }: MembersListProps) {
  const currentUser = await getUser();
  const members = await prisma.member.findMany({
    where: {
      organizationId,
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
      { createdAt: "asc" }, // Then by join date
    ],
  });

  // Get current user's role in this workspace
  const currentUserMember = members.find((m) => m.user.id === currentUser?.id);
  const currentUserRole = currentUserMember?.role;

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No members yet</h3>
          <p className="text-muted-foreground">
            Invite people to join your organization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Members
        </CardTitle>
        <CardDescription>
          {members.length} member{members.length === 1 ? "" : "s"} in this
          workspace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map(async (member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={member.user.image || undefined} />
                <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 ">
                  <span>{member.user.name}</span>
                  {(() => {
                    // Si c'est un owner → toujours Badge (pas modifiable)
                    if (member.role === "owner") {
                      return (
                        <Badge variant={getRoleVariant(member.role)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            <span>{member.role}</span>
                          </div>
                        </Badge>
                      );
                    }

                    // Si l'utilisateur connecté est owner ou admin → Select pour modifier les autres
                    if (
                      currentUserRole === "owner" ||
                      currentUserRole === "admin"
                    ) {
                      return <MemberSelect member={member} />;
                    }

                    // Sinon → Badge seulement (pas de modification)
                    return (
                      <Badge variant={getRoleVariant(member.role)}>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          <span>{member.role}</span>
                        </div>
                      </Badge>
                    );
                  })()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {member.user.email}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Joined {formatDate(member.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {member.role !== "owner" &&
                member.user.id !== currentUser?.id &&
                (await hasPermission({ workspace: ["delete"] })) && (
                  <RemoveMemberDialog member={member} />
                )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
