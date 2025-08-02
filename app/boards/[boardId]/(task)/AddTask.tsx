"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const TaskFormSchema = z.object({
  content: z.string().min(2, {
    message: "The card content must be at least 2 characters long.",
  }),
});

type AddTaskProps = {
  columnId: string;
  boardId: string;
  showForm: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAdd: (content: string, columnId: string, boardId: string) => Promise<void>;
};

export const AddTask = ({
  columnId,
  boardId,
  showForm,
  onOpen,
  onClose,
  onAdd,
}: AddTaskProps) => {
  const form = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof TaskFormSchema>) {
    await onAdd(values.content, columnId, boardId);

    form.reset();
    onClose();
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
        <span>Add a card</span>
      </Button>
    );
  }

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
            Add card
          </Button>
          <X
            className="cursor-pointer"
            onClick={() => {
              onClose();
            }}
          />
        </div>
      </form>
    </Form>
  );
};
