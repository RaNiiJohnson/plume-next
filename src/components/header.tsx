import Link from "next/link";
import { SidebarTrigger } from "./ui/sidebar";

export default async function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur">
      <div className="mx-auto flex items-center gap-4 pl-4 py-2">
        <Link
          href="/"
          className="text-2xl text-primary font-bold hover:opacity-80 transition"
        >
          Plume
        </Link>
        <span className="flex-1" />

        <SidebarTrigger />
      </div>
    </header>
  );
}
