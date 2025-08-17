"use client";

import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth"; // Tu devras créer cette action

export function LogOutForm() {
  return (
    <form action={signOutAction} className="w-full">
      <button type="submit" className="flex items-center gap-2 w-full">
        <LogOut />
        Logout
      </button>
    </form>
  );
}
