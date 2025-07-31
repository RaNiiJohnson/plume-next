import Link from "next/link";
import AuthButton from "./authButton";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
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
        <ThemeToggle />
        <AuthButton />
      </div>
    </header>
  );
}
