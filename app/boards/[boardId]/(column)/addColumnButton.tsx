"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ColumnForm } from "./column-form";
import { useState } from "react";

type AddColumnButtonProps = {
  boardId: string;
};

// 2. Accepter les props en argument
export function AddColumnButton({ boardId }: AddColumnButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="flex gap-2 rounded-xl min-w-[260px] bg-primary/10 border border-primary text-primary font-semibold shadow-lg hover:bg-primary/20 transition"
        >
          <Plus />
          <span>Ajouter une autre liste</span>
          <span className="flex-1"></span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau liste</DialogTitle>
          <DialogDescription>Choisissez un nom.</DialogDescription>
        </DialogHeader>
        <ColumnForm boardId={boardId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
