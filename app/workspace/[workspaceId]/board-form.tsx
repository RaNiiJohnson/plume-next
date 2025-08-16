"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useAction } from "next-safe-action/hooks";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addBoardSafeAction } from "./board.action";
import { useRouter } from "next/navigation";

const BoardFormSchema = z.object({
  title: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  organizationId: z.string(),
});

export const BoardForm = ({
  onSuccess,
  organizationId,
}: {
  onSuccess?: () => void;
  organizationId: string;
}) => {
  const router = useRouter();
  // 1. Define your form.
  const form = useForm<z.infer<typeof BoardFormSchema>>({
    resolver: zodResolver(BoardFormSchema),
    defaultValues: {
      title: "",
      organizationId,
    },
  });

  const { executeAsync } = useAction(addBoardSafeAction);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof BoardFormSchema>) {
    const board = await executeAsync(values);
    form.reset();
    // router.push(`/workspace/${organizationId}/${board.data?.id}`);
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
                <Input placeholder="e.g. Web Project" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Create
        </Button>
      </form>
    </Form>
  );
};
