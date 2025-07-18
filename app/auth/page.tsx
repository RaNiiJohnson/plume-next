import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/auth-server";
import { Edit } from "lucide-react";
import Link from "next/link";
import { unauthorized } from "next/navigation";

export default async function AuthPage() {
  const user = await getUser();

  if (!user) {
    return unauthorized();
  }
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0">
        <CardTitle>User profile</CardTitle>
        <div className="flex-1"></div>
        <Link className="flex items-center gap-2 text-sm" href="/auth/edit">
          <Edit className="size-3 text-muted-foreground" /> Edit
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Name</span>
            <span>{user.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
