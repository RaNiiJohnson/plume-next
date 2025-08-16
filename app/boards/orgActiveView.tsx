"use client";
import { authClient } from "@/lib/auth-client";

export function ActiveOrgView() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  return (
    <div className="text-sm text-primary/40">
      {activeOrganization ? <p>({activeOrganization.name})</p> : null}
    </div>
  );
}
