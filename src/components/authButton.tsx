import { getUser } from "@/lib/auth-server";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
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
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="border-muted bg-popover text-popover-foreground shadow-md rounded-md"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name ?? "Avatar"}
              />
              <AvatarFallback>{user.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
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
            >
              <span className="flex items-center gap-2">
                <LogOut />
                Logout
              </span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
