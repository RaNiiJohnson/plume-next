import { getUser } from "@/lib/auth-server";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { headers } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default async function AuthButton() {
  const user = await getUser();

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className={buttonVariants({ size: "sm", variant: "outline" })}
      >
        <LogIn className="size-4" />
        Sign in
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-accent/60 hover:shadow transition">
          <Avatar className="h-7 w-7">
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name ?? "Avatar"}
            />
            <AvatarFallback>{user.name?.[0] ?? "?"}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm max-w-[120px] truncate">
            {user.name}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <form>
            <Button
              variant="link"
              className="flex items-center gap-2 w-full text-sm"
              formAction={async () => {
                "use server";
                await auth.api.signOut({ headers: await headers() });
                redirect("/auth/signin");
              }}
            >
              <LogOut className="size-4" /> Logout
            </Button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
