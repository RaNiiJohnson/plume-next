import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  workspace: ["create", "update", "delete", "leave", "invite"],
  member: ["create", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

const member = ac.newRole({
  workspace: ["create", "leave"],
  ...memberAc.statements,
});

const admin = ac.newRole({
  ...adminAc.statements,
  workspace: ["create", "update", "delete", "leave", "invite"],
});

const owner = ac.newRole({
  ...ownerAc.statements,
  workspace: ["create", "update", "delete", "invite"],
});

export { member, admin, owner, ac };
