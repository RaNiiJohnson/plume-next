
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
// import { useAction } from "next-safe-action/hooks"; // On n'en a plus besoin ici car on appelle `onAdd`
import { useForm } from "react-hook-form";
import { z } from "zod";
// import { addTaskSafeAction } from "./task.action"; // On n'en a plus besoin ici car on appelle `onAdd`

// Mettons à jour ce schéma pour qu'il reflète ce que le formulaire gère directement
const TaskFormSchema = z.object({
  content: z.string().min(2, {
    message: "The card content must be at least 2 characters long.",
  }),
  // columnId est déjà un default value et est passé via props
  // boardId est aussi passé via props, mais n'est pas directement un champ du formulaire
  // Donc, le schéma du formulaire ne gère que le "content"
  // et on va passer columnId et boardId manuellement à `onAdd`
});

export const AddTask = ({
  columnId,
  boardId, // Reçois boardId des props
  showForm,
  onOpen,
  onClose,
  onAdd, // onAdd attend maintenant (content: string, columnId: string, boardId: string)
}: {
  columnId: string;
  boardId: string; // Ajoute boardId aux props
  showForm: boolean;
  onOpen: () => void;
  onClose: () => void;
  // onAdd va maintenant prendre le boardId et columnId directement
  onAdd: (content: string, columnId: string, boardId: string) => Promise<void>;
}) => {
  const form = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      content: "",
      // columnId, // n'est pas un champ du formulaire, mais une prop
    },
  });

  // const { executeAsync } = useAction(addTaskSafeAction); // Ceci n'est plus nécessaire

  async function onSubmit(values: z.infer<typeof TaskFormSchema>) {
    // Appelle la fonction onAdd du parent (BoardView), qui gère l'optimiste ET l'appel à la Server Action
    await onAdd(values.content, columnId, boardId); // Passe le content, columnId, et boardId

    form.reset();
    onClose(); // Ferme le formulaire après l'ajout
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
              onClose(); // Ferme le formulaire
            }}
          />
        </div>
      </form>
    </Form>
  );
};
