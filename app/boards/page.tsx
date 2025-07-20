import { SecondPageLayout } from "@/components/layout";
import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { AddBoardButton } from "./addBoardButton";
import { Trash2, Pencil } from "lucide-react";
import { unauthorized } from "next/navigation";
import { deleteBoardAction, updateBoardAction } from "./board.action";
import { revalidatePath } from "next/cache";

export default async function Home() {
  const user = await getUser();
  const boards = await prisma.board.findMany({
    where: {
      userId: user?.id,
    },
  });

  if (!user) {
    return unauthorized();
  }

  // const changeTitle = async (title: string, boardId: string) => {
  //   "use server";

  //   await updateBoardAction({
  //     title,
  //     boardId,
  //   });

  //   revalidatePath("/boards");
  // };

  return (
    <SecondPageLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {boards?.map((board) => (
          <div key={board.id} className="relative group">
            {/* Boutons actions en haut à droite, cachés sauf au hover */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <form>
                <button
                  formAction={async () => {
                    "use server";
                    await deleteBoardAction({ boardId: board.id });

                    revalidatePath("");
                  }}
                  className="p-2 rounded-full bg-background border border-muted shadow hover:bg-accent text-muted-foreground hover:text-destructive transition"
                  title="Éditer"
                  // onClick={...}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>
            <Link
              href={`/boards/${board.id}`}
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
          </div>
        ))}
        <AddBoardButton />
      </div>
    </SecondPageLayout>
  );
}
