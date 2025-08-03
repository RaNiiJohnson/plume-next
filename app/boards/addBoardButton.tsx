"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { BoardForm } from "./board-form";
import { useState } from "react";

export function AddBoardButton() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center justify-center rounded-xl bg-muted shadow transition-shadow p-6 border-3 border-dashed border-primary/40 hover:bg-primary/20 group min-h-[110px]">
          <Plus className="w-8 h-8 mb-2 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-lg font-semibold group-hover:text-primary transition">
            Create new board
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new board</DialogTitle>
        </DialogHeader>

        <BoardForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
