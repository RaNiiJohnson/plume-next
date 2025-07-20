"use client";

import { Button } from "@/components/ui/button";
import { Lock, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-2">
        <Search className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold">404 - Not found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you are looking for does not exist.
        <br />
        It may have been moved or deleted.
      </p>
      <div className="flex gap-2 justify-center">
        <Button asChild variant="outline">
          <Link href="/">Go to home</Link>
        </Button>
        <Button variant="ghost" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    </div>
  );
}
