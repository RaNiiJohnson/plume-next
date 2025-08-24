"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Member } from "@/generated/prisma";
import React from "react";
import { updateMember } from "../members/member.action";
import { toast } from "sonner";
import { getRoleIcon, MEMBER_ROLES } from "../_lib/member-utils";

export default function MemberSelect({ member }: { member: Member }) {
  return (
    <Select
      onValueChange={async (newRole: "member" | "admin") => {
        const { success, error } = await updateMember(member, newRole);

        if (!success) {
          toast.error(error || "Failed to update member role");
          return;
        }

        toast.success("Member role updated successfully");
      }}
    >
      <SelectTrigger size="sm">
        <div className="flex items-center gap-1">
          {getRoleIcon(member.role)}
          <span>{member.role}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {MEMBER_ROLES.filter((role) => role !== "owner").map((role) => (
          <SelectItem key={role} value={role}>
            <div className="flex items-center gap-1">
              {getRoleIcon(role)}
              <span>{role}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
