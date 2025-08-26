import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth-server";
import { Lock } from "lucide-react";
import Link from "next/link";

export default async function Unauthorized() {
  const user = await getUser();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-2">
        <Lock className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold">Restricted Access</h1>
      <p className="text-muted-foreground max-w-md">
        You are not authorized to access this page,
        <br /> or this page does not exist.
        <br />
        {!user && "Please sign in to continue."}
      </p>
      {user ? (
        <div className="flex gap-2 justify-center">
          <Button variant="outline">
            <Link href="/">Go to home</Link>
          </Button>
          <BackButton />
        </div>
      ) : (
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <BackButton />
        </div>
      )}
    </div>
  );
}
