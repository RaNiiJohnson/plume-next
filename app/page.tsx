import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Kanban, Rocket } from "lucide-react";

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Kanban className="w-16 h-16 text-primary" />
        <h1 className="text-3xl font-semibold italic tracking-tight">
          “Great things are done by a series of small things brought together.”
          <br />
          <span className="text-base not-italic font-normal">
            — Vincent Van Gogh
          </span>
        </h1>
        <p className="text-muted-foreground max-w-xl mt-4">
          Plume helps you organize your projects, collaborate with your team,
          and turn small steps into big achievements.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/boards">
            <Rocket className="w-5 h-5 mr-2" />
            View my boards
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/boards/new">+ New board</Link>
        </Button>
      </div>
    </div>
  );
}
