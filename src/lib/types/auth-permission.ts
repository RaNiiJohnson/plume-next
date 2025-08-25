export type Authpermisson = {
  workspace?: Array<"create" | "update" | "delete" | "leave" | "invite">;
  organization?: Array<"update" | "delete">;
  member?: Array<"create" | "update" | "delete">;
  invitation?: Array<"create" | "cancel">;
  team?: Array<"create" | "update" | "delete">;
};
