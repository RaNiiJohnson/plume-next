import Link from "next/link";
import AuthButton from "./authButton";
import { ThemeToggle } from "./theme-toggle";
import { Bell } from "lucide-react";
import { getUser } from "@/lib/auth-server";

export default async function Header() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur">
      <div className="mx-auto flex items-center gap-4 px-4 py-2">
        <Link
          href="/"
          className="text-2xl font-bold text-primary hover:opacity-80 transition"
        >
          Plume
        </Link>
        <span className="flex-1" />
        <AuthButton />
        {user && <Bell size={18} />}
        <ThemeToggle />
      </div>
    </header>
  );
}
