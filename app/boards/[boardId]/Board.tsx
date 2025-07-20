"use client";
import { SecondPageLayout } from "@/components/layout";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddColumnButton } from "./(column)/addColumnButton";
import { AddTask } from "./(task)/AddTask";

interface Task {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  position?: number;
}

interface Board {
  id: string;
  title: string;
  columns: Column[];
}
export default function BoardView({ board }: { board: Board }) {
  // Si openFormColId === column.id, alors le formulaire est ouvert pour cette colonne, sinon il est fermé.
  const [openFormColId, setOpenFormColId] = useState<string | null>(null);

  return (
    <SecondPageLayout>
      <div className="text-3xl font-bold text-primary tracking-tight mb-6 border-b border-muted pb-2">
        {board.title}
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-x-auto min-h-0">
          <div className="flex gap-6 items-start h-full">
            {board.columns
              .slice()
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((column) => (
                <div
                  key={column.id}
                  className="bg-card border border-muted rounded-xl min-w-[260px] flex-shrink-0 shadow-md p-4 h-fit transition hover:shadow-lg"
                >
                  <h3 className="font-semibold mb-4 text-lg text-card-foreground">
                    {column.title}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {column.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-background border border-muted p-3 rounded-lg shadow-sm hover:bg-accent transition cursor-pointer select-none"
                      >
                        <span>{task.content}</span>
                      </div>
                    ))}
                    {column.tasks.length === 0 && (
                      <div className="text-muted-foreground italic text-sm">
                        Aucune tâche
                      </div>
                    )}
                  </div>
                  <AddTask
                  columnId={column.id}
                    showForm={openFormColId === column.id}
                    onOpen={() => setOpenFormColId(column.id)}
                    onClose={() => setOpenFormColId(null)}
                    onAdd={async (content) => {
                      setOpenFormColId(null);
                    }}
                  />
                </div>
              ))}

            <AddColumnButton boardId={board.id} />
          </div>
        </div>
      </div>
    </SecondPageLayout>
  );
}

//             - showForm : true si le formulaire doit être affiché pour cette colonne
//             - onOpen : fonction pour ouvrir le formulaire de cette colonne (et fermer les autres)
//             - onClose : fonction pour fermer le formulaire
//             - onAdd : fonction appelée lors de l'ajout d'une carte (ferme aussi le formulaire)
//             Cette logique garantit qu'un seul formulaire d'ajout est ouvert à la fois sur tout le board.
