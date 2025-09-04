import { Kanban } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="px-6 py-8 border-t border-border/40">
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Kanban className="w-4 h-4" />
            <span>
              © {new Date().getFullYear()} Plume. Built for productivity.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/support"
              className="hover:text-foreground transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
