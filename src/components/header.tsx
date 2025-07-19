import AuthButton from "./authButton";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  return (
    <div className="sticky max-w-5xl mx-auto top-0 z-50 w-screen backdrop-blur-md">
      <div className="flex items-center gap-2 p-2">
        <span className="text-2xl font-bold">Plume</span>
        <span className="flex-1"></span>
        <ThemeToggle />
        <AuthButton />
      </div>
    </div>
  );
}
