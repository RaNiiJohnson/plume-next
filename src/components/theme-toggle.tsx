"use client";

import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { SidebarMenuSubButton } from "./ui/sidebar";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <Moon className="hidden w-5 h-5 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
export function ThemeToggleDark() {
  const { theme, setTheme } = useTheme();
  return (
    <SidebarMenuSubButton
      className="cursor-pointer"
      onClick={() => setTheme("dark")}
    >
      <Moon /> <span>Dark</span>
      <Check className="hidden dark:block" />
    </SidebarMenuSubButton>
  );
}
export function ThemeToggleLight() {
  const { theme, setTheme } = useTheme();
  return (
    <SidebarMenuSubButton
      className="cursor-pointer"
      onClick={() => setTheme("light")}
    >
      <Sun /> <span>Light</span> <Check className="dark:hidden" />
    </SidebarMenuSubButton>
  );
}
