"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { LandingLayoutWrapper } from "~/components/landing-layout-wrapper";
import { toast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { Loader } from "@fondingo/ui/lucide";
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

const formSchema = z.object({
  email: z.string().email(),
});

export default function VerificationPage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const sendEmailMutation =
    trpc.misc.resendVerificationEmailByEmail.useMutation({
      onError: ({ message }) =>
        toast({
          title: "Something went wrong",
          description: message,
        }),
      onSuccess: ({ toastTitle, toastDescription }) => {
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        setIsNavigating(true);
        form.reset();
        router.push("/");
        router.refresh();
      },
    });

  const isLoading = useMemo(
    () => sendEmailMutation.isPending || isNavigating,
    [sendEmailMutation.isPending, isNavigating],
  );

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      sendEmailMutation.mutate(values.email);
    },
    [sendEmailMutation],
  );
  return (
    <LandingLayoutWrapper>
      <div className="mx-auto max-w-[27rem] space-y-6 rounded-sm border-2 border-neutral-200 px-4 py-10 md:space-y-10 md:p-14">
        <h1 className="text-4xl font-semibold">Email Verification</h1>
        <p className="leading-[1.7em] tracking-wide text-neutral-600">
          Enter the email address you used to sign up for{" "}
          <span className="text-cta font-medium">FS</span>plit and we&apos;ll
          send you a link to activate your account.
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
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </div>
      <div className="flex translate-x-[7.1rem] flex-col items-end">
        <div className="mt-6 flex items-center text-sm text-neutral-400">
          Forgot your password?
          <Button
            asChild
            size="sm"
            variant="link"
            disabled={isLoading}
            className="text-cta"
          >
            <Link href="/forgot-password">Reset</Link>
          </Button>
        </div>
      </div>
    </LandingLayoutWrapper>
  );
}
