"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { Github } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SignInFormSchema = z.object({
  email: z.email({
    message: "Invalid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

type ProviderEnum = Parameters<typeof signIn.social>[0]["provider"];

export function SigninForm() {
  const router = useRouter();
  // 1. Define your form.
  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof SignInFormSchema>) {
    await signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.push("/auth");
          router.refresh();
        },
        onError: (error) => {
          toast.error(error.error.message);
        },
      }
    );
  }

  async function signInWithProvider(provider: ProviderEnum) {
    await signIn.social(
      {
        provider,
        callbackURL: "/auth",
      },
      {
        onSuccess: () => {},
        onError: (error) => {
          toast.error(error.error.message);
        },
      }
    );
  }
  return (
    <div className="flex items-center flex-col gap-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Password</FormLabel>
                  <div className="flex-1"></div>
                  <Link
                    className="text-indigo-500 text-sm"
                    href="/auth/forget-password"
                  >
                    Forget Password
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Sign In</Button>
        </form>
      </Form>
      <p className="text-sm text-muted-foreground">Or</p>
      <div className="flex w-full gap-4">
        <Button
          className="flex-1"
          variant="outline"
          onClick={() => {
            signInWithProvider("github");
          }}
        >
          <Github />
          Sign in with github
        </Button>
      </div>
    </div>
  );
}
