import { getUser } from "@/lib/auth-server";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { headers } from "next/headers";

export default async function AuthButton() {
  const user = await getUser();

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className={buttonVariants({ size: "sm", variant: "outline" })}
      >
        Sign in
      </Link>
    );
  }

  return (
    <form>
      <button
        className="flex items-center w-full gap-2"
        formAction={async () => {
          "use server";

          await auth.api.signOut({
            headers: await headers(),
          });
          redirect("/auth/signin");
        }}
      >
        <LogOut className="size-4" /> Logout
      </button>
    </form>
  );
}
