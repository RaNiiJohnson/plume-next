import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth-server";
import { Kanban, Rocket } from "lucide-react";
import Link from "next/link";

const activeUsers = [
  {
    name: "Sarah Chen",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    initials: "SC",
    role: "Product Manager",
  },
  {
    name: "Marcus Johnson",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    initials: "MJ",
    role: "Developer",
  },
  {
    name: "David Kim",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    initials: "DK",
    role: "Team Lead",
  },
  {
    name: "Sophie Laurent",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
    initials: "SL",
    role: "Marketing",
  },
  {
    name: "Elena Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=40&h=40&fit=crop&crop=face",
    initials: "ER",
    role: "Designer",
  },
];

export default async function Home() {
  const user = await getUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-12">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Kanban className="w-16 h-16 text-primary" />
        </div>

        <h1 className="text-3xl font-semibold italic tracking-tight max-w-4xl">
          Plume helps you organize your projects, collaborate with your team,
          and turn small steps into big achievements.
        </h1>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {activeUsers.map((user, index) => (
              <Avatar
                key={index}
                className="border-2 border-background w-10 h-10"
              >
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-xs font-medium">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border-2 border-background">
              <span className="text-xs font-medium text-muted-foreground">
                +2k
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Rejoint par{" "}
          <span className="font-medium text-foreground">
            Sarah, Marcus, Elena
          </span>{" "}
          et <span className="font-medium text-foreground">2,147 autres</span>{" "}
          cette semaine
        </p>
      </div>

      {user ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="text-base px-8">
            <Link href="/boards">
              <Rocket className="w-5 h-5 mr-2" />
              View my boards
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="text-base px-8">
            <Link href="/auth/signup">
              <Rocket className="w-5 h-5 mr-2" />
              Get started free
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8">
            <Link href="/auth/signin">Sign in</Link>
          </Button>
        </div>
      )}

      {/* Message pour nouveaux utilisateurs */}
      <div className="text-center max-w-lg">
        <p className="text-sm text-muted-foreground">
          ✨ <span className="font-medium">Free forever</span> • No credit card
          required •<span className="font-medium">2 minutes</span> to set up
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <div className="p-4 rounded-lg bg-muted/20 border-l-4 border-primary">
          <p className="text-sm italic text-muted-foreground mb-2">
            "Plume transformed how our team collaborates. We've never been more
            organized!"
          </p>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={activeUsers[0].avatar}
                alt={activeUsers[0].name}
              />
              <AvatarFallback className="text-xs">
                {activeUsers[0].initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{activeUsers[0].name}</span>
            <span className="text-xs text-muted-foreground">
              • {activeUsers[0].role}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/20 border-l-4 border-green-500">
          <p className="text-sm italic text-muted-foreground mb-2">
            "The best project management tool I've used. Simple yet powerful!"
          </p>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={activeUsers[1].avatar}
                alt={activeUsers[1].name}
              />
              <AvatarFallback className="text-xs">
                {activeUsers[1].initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{activeUsers[1].name}</span>
            <span className="text-xs text-muted-foreground">
              • {activeUsers[1].role}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/20 border-l-4 border-purple-500">
          <p className="text-sm italic text-muted-foreground mb-2">
            "Our productivity increased by 40% since switching to Plume.
            Amazing!"
          </p>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={activeUsers[2].avatar}
                alt={activeUsers[2].name}
              />
              <AvatarFallback className="text-xs">
                {activeUsers[2].initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{activeUsers[2].name}</span>
            <span className="text-xs text-muted-foreground">
              • {activeUsers[2].role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
