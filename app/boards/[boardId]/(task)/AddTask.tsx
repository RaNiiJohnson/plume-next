"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { addColumnSafeAction } from "../(column)/column.action";
import { addTaskSafeAction } from "./task.action";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const TaskFormSchema = z.object({
  content: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  columnId: z.string(),
});

export const AddTask = ({
  columnId,
  showForm,
  onOpen,
  onClose,
  onAdd,
}: {
  columnId: string;
  showForm: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAdd: (content: string) => void;
}) => {
  const form = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      content: "",
      columnId,
    },
  });

  const { executeAsync } = useAction(addTaskSafeAction);

  async function onSubmit(values: z.infer<typeof TaskFormSchema>) {
    // await executeAsync({ ...values, boardId }); <-- PAS BESOIN DE SPREAD OU DE boardId EN PLUS
    await executeAsync(values);
    form.reset();
  }

  if (!showForm) {
    return (
      <Button
        size="lg"
        variant="ghost"
        className="text-muted-foreground"
        onClick={onOpen}
      >
        <Plus />
        <span>ajouter une carte</span>
      </Button>
    );
  }

  // Si showForm est true, on affiche le formulaire d'ajout de carte
  return (
    <Form {...form}>
      <form className="space-y-3 mt-3" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input autoFocus placeholder="Contenu de la carte" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row gap-2 items-center">
          <Button
            size="lg"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            Ajouter une carte
          </Button>
          <X
            className="cursor-pointer"
            onClick={() => {
              onClose(); // Ferme le formulaire
            }}
          />
        </div>
      </form>
    </Form>
  );
};
