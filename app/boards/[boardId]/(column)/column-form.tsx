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
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addColumnSafeAction } from "./column.action";

const ColumnFormSchema = z.object({
  title: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  boardId: z.string(),
});

export const ColumnForm = ({
  boardId,
  onSuccess,
}: {
  boardId: string;
  onSuccess?: () => void;
}) => {
  const form = useForm<z.infer<typeof ColumnFormSchema>>({
    resolver: zodResolver(ColumnFormSchema),
    defaultValues: {
      title: "",
      boardId, // <-- important !
    },
  });

  const { executeAsync } = useAction(addColumnSafeAction);

  async function onSubmit(values: z.infer<typeof ColumnFormSchema>) {
    // await executeAsync({ ...values, boardId }); <-- PAS BESOIN DE SPREAD OU DE boardId EN PLUS
    await executeAsync(values);
    form.reset();
    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
};
