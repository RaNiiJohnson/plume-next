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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
        <div className="flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition">
          <Avatar className="h-7 w-7">
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name ?? "Avatar"}
            />
            <AvatarFallback>{user.name?.[0] ?? "?"}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm max-w-[120px] truncate text-muted-foreground group-hover:text-foreground">
            {user.name}
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44 border-muted bg-popover text-popover-foreground shadow-md rounded-md"
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
          Account
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <form className="w-full">
            <button
              type="submit"
              formAction={async () => {
                "use server";
                await auth.api.signOut({ headers: await headers() });
                redirect("/auth/signin");
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-destructive hover:text-destructive-foreground transition"
            >
              <span className="flex items-center gap-2">
                <LogOut className="size-4" />
                Logout
              </span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
