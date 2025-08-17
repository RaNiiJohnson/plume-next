"use client";
import { LampDesk } from "lucide-react";
import { useRouter } from "next/navigation";
import { setActiveWspace } from "./workspace.action";

type Organization = {
  id: string;
  name: string;
};

export function WorkspaceLinks({
  organization,
}: {
  organization: Organization;
}) {
  const router = useRouter();

  return (
    <button
      key={organization.id}
      onClick={async () => {
        try {
          await setActiveWspace(organization.id);
          router.push(`workspace/${organization.id}`);
          console.log(organization.id);
        } catch (error) {
          console.log(error);
        }
      }}
      className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <LampDesk className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium group-hover:text-primary transition-colors">
            {organization.name}
          </h4>
          <p className="text-sm text-muted-foreground">Click to view boards</p>
        </div>
      </div>
    </button>
  );
}
