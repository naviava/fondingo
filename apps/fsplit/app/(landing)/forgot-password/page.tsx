"use client";

import { useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { toast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@fondingo/ui/form";

import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";
import { archivo } from "~/utils";

const formSchema = z.object({
  email: z.string().email(),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [disableUI, setDisableUI] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const sendEmailMutation = trpc.user.sendResetPasswordEmail.useMutation({
    onError: ({ message }) =>
      toast({
        title: "Something went wrong",
        description: message,
      }),
    onSuccess: ({ toastTitle, toastDescription }) => {
      setDisableUI(true);
      toast({
        title: toastTitle,
        description: toastDescription,
      });
      form.reset();
      router.push("/");
      router.refresh();
    },
  });

  const isLoading = useMemo(
    () => sendEmailMutation.isPending || disableUI,
    [disableUI, sendEmailMutation.isPending],
  );

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      sendEmailMutation.mutate(values.email);
    },
    [sendEmailMutation],
  );
  return (
    <div
      className={cn(
        "flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 md:min-h-[calc(100vh-440px)] lg:min-h-[calc(100vh-448px)]",
        archivo.className,
      )}
    >
      <div className="mx-auto max-w-[27rem] space-y-6 rounded-sm border-2 border-neutral-200 px-4 py-10 md:space-y-10 md:p-14">
        <h1 className="text-4xl font-semibold">Can&apos;t log in?</h1>
        <p className="leading-[1.7em] tracking-wide text-neutral-600">
          Not to worry. Enter the email address you use to sign in to{" "}
          <span className="text-cta font-medium">FS</span>plit and we&apos;ll
          send you a link to reset your password.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-semibold">
                      Enter your email address:
                    </FormLabel>
                    <FormMessage className="text-xs md:text-sm" />
                  </div>
                  <FormControl>
                    <Input
                      type="email"
                      disabled={isLoading}
                      placeholder="yourname@email.com"
                      {...field}
                      className="form-input placeholder:text-neutral-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="cta"
              disabled={isLoading}
              className="w-full text-base"
            >
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
