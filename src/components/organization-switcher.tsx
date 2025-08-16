"use client";

import { Organization } from "@/lib/types/organization";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type OrganizationSwitcherProps = {
  organizations: Organization[];
};

export function useActiveOrganizationSync(organizations: Organization[]) {
  const { data: activeOrganization, isPending } =
    authClient.useActiveOrganization();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncActiveOrganization = async () => {
      if (isPending) return;

      try {
        // Si pas d'organisation active et qu'il y en a des disponibles
        if (!activeOrganization && organizations.length > 0) {
          const { data: session } = await authClient.getSession();
          const sessionActiveOrgId = session?.session.activeOrganizationId;

          // Trouve l'organisation correspondant à l'ID de session
          const orgFromSession = organizations.find(
            (org) => org.id === sessionActiveOrgId
          );

          if (orgFromSession) {
            console.log(
              "🔄 Syncing active org from session:",
              sessionActiveOrgId
            );
            await authClient.organization.setActive({
              organizationId: sessionActiveOrgId,
            });
          } else {
            // Fallback sur la première organisation
            console.log("🔄 Setting first org as active:", organizations[0].id);
            await authClient.organization.setActive({
              organizationId: organizations[0].id,
            });
          }
        }
      } catch (error) {
        console.error("Error syncing active organization:", error);
      } finally {
        setIsReady(true);
      }
    };

    syncActiveOrganization();
  }, [isPending, activeOrganization, organizations]);

  return {
    activeOrganization,
    isPending: isPending || !isReady,
  };
}

export function OrganizationSwitcher({
  organizations,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const { activeOrganization, isPending } =
    useActiveOrganizationSync(organizations);

  const handleChangeOrganization = async (organizationId: string) => {
    try {
      const { error } = await authClient.organization.setActive({
        organizationId,
      });

      if (error) {
        console.error(error);
        toast.error("Failed to switch organization");
        return;
      }

      toast.success("Organization switched successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to switch organization");
    }
  };

  if (isPending) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      onValueChange={handleChangeOrganization}
      value={activeOrganization?.id || ""}
    >
      <SelectTrigger size="sm">
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((organization) => (
          <SelectItem key={organization.id} value={organization.id}>
            {organization.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
