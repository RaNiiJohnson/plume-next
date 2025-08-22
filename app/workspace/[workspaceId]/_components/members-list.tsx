import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Crown, Shield, User, Users } from "lucide-react";

type MembersListProps = {
  organizationId: string;
};

export async function MembersList({ organizationId }: MembersListProps) {
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
      { role: "asc" }, // Show admins first
      { createdAt: "asc" }, // Then by join date
    ],
  });

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case "owner":
        return <Shield className="w-4 h-4 text-yellow-600" />;
      default:
        return <User className="w-4 h-4 text-primary" />;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "default";
      case "owner":
        return "default";
      default:
        return "secondary";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
          organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={member.user.image || undefined} />
                <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="flex gap-2 font-medium">
                  <span>{member.user.name}</span>
                  <Badge
                    variant={getRoleVariant(member.role)}
                    className="flex items-center gap-1"
                  >
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {member.user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {member.role !== "owner" && member.role !== "admin" && (
                <Button variant="destructive">Remove Member</Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
