import { Crown, Shield, User } from "lucide-react";

export const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return <Crown className="size-3 text-yellow-600" />;
    case "owner":
      return <Shield className="size-3 text-yellow-600" />;
    default:
      return <User className="size-3 text-primary" />;
  }
};

export const getRoleVariant = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "default" as const;
    case "owner":
      return "default" as const;
    default:
      return "secondary" as const;
  }
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const MEMBER_ROLES = ["admin", "owner", "member"] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];
