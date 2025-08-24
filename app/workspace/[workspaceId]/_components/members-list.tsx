import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import prisma from "@/lib/prisma";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { removeMember } from "../members/member.action";
import { hasPermission } from "@/lib/server/permissions";
import { formatDate } from "@/lib/form-date";
import { getRoleIcon, getInitials, MEMBER_ROLES } from "../_lib/member-utils";

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
              <div>
                <h3 className="flex items-center gap-2 ">
                  <span>{member.user.name}</span>
                  <Select>
                    <SelectTrigger size="sm">
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        <span>{member.role}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(role)}
                            <span>{role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                member.role !== "admin" &&
                (await hasPermission({ member: ["delete"] })) && (
                  <form>
                    <Button
                      formAction={async () => {
                        "use server";
                        const { success, error } = await removeMember(member);

                        if (!success) {
                          toast.error(error || "Failed to remove member");
                          return;
                        }

                        toast.success("Member removed successfully");
                      }}
                      variant="destructive"
                    >
                      Remove member
                    </Button>
                  </form>
                )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
