"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ColumnForm } from "./column-form";

type AddColumnButtonProps = {
  boardId: string;
};

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
          <span>Add another list</span>
          <span className="flex-1"></span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new list</DialogTitle>
        </DialogHeader>
        <ColumnForm boardId={boardId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
