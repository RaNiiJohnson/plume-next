import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

export default async function WorkspacePage() {
  const session = await getSession();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  } else redirect("/");
}
