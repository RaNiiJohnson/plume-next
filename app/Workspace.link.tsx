"use client";
import Link from "next/link";
import { LampDesk } from "lucide-react";
import { setActiveWspace } from "./workspace.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Organization {
  id: string;
  name: string;
}

interface WorkspaceLinksProps {
  organizations: Organization[];
}

export function WorkspaceLinks({ organizations }: WorkspaceLinksProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {organizations.map((org) => (
        <button
          key={org.id}
          onClick={async () => {
            try {
              await setActiveWspace(org.id);
              router.push(`workspace/${org.id}`);
              console.log(org.id);
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
                {org.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                Click to view boards
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
