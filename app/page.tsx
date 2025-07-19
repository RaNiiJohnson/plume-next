import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const boards = await prisma.board.findMany();

  return (
    <div className="p-8 bg-muted min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {boards?.map((board) => (
          <Link
            href={`/boards/${board.id}`}
            key={board.id}
            className="block rounded-xl bg-card text-card-foreground shadow hover:shadow-lg transition-shadow p-6 border border-muted hover:bg-accent/60 group"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-lg font-bold group-hover:bg-primary group-hover:text-primary-foreground transition">
                {board.title[0]}
              </span>
              <span className="text-xl font-semibold group-hover:text-primary transition">
                {board.title}
              </span>
            </div>
            <div className="mt-2 text-muted-foreground text-sm">
              Voir le board
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
