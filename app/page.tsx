import { Button } from "@/components/ui/button";
import { WorkspaceLinks } from "@/components/Workspace.link";
import { getUser } from "@/lib/auth-server";
import { getOrganizations } from "@/lib/server/organizations";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const organizations = await getOrganizations();
  const user = await getUser();

  return (
    <div className="flex items-center justify-center px-6 py-12 min-h-screen ">
      <div className="max-w-3xl mx-auto text-center space-y-12">
        {/* Hero */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
            Focus on what matters.
            <br />
            <span className="text-muted-foreground">
              We'll handle the rest.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Simple project management for teams who value clarity and
            efficiency.
          </p>
        </div>

        {/* Actions */}
        {user ? (
          <div className="space-y-8">
            {organizations.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm font-medium">Your workspaces</p>
                <div className="grid gap-3 max-w-md mx-auto">
                  {organizations.map((organization) => (
                    <WorkspaceLinks
                      key={organization.id}
                      organization={organization}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">No workspaces yet</p>
                <Button asChild>
                  <Link href="/create-workspace">
                    Create your first workspace
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <Button asChild size="lg" className="px-8">
              <Link href="/auth/signup">Start free trial</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
