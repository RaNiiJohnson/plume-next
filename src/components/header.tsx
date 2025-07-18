import AuthButton from "./authButton";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  return (
    <div className="sticky top-0 z-50 w-screen shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2 p-2">
        <ThemeToggle />
        <span className="flex-1"></span>
        <AuthButton />
      </div>
    </div>
  );
}
