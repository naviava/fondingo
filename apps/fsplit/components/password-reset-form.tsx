"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { serverClient } from "~/lib/trpc/server-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { trpc } from "~/lib/trpc/client";
import { z } from "@fondingo/utils/zod";

import { Eye, EyeOff } from "@fondingo/ui/lucide";
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

const formSchema = z
  .object({
    password: z.string().min(6, { message: "Password too short" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface IProps {
  token: Awaited<ReturnType<typeof serverClient.misc.getPasswordResetToken>>;
}

export function PasswordResetForm({ token }: IProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = trpc.misc.resetPassword.useMutation({
    onError: ({ message }) =>
      toast({
        title: "Something went wrong",
        description: message,
      }),
    onSuccess: ({ toastTitle, toastDescription }) => {
      setIsNavigating(true);
      toast({
        title: toastTitle,
        description: toastDescription,
      });
      router.push("/signin");
      router.refresh();
    },
  });

  const isLoading = useMemo(
    () => resetPasswordMutation.isPending || isNavigating,
    [resetPasswordMutation.isPending, isNavigating],
  );

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      resetPasswordMutation.mutate({
        ...values,
        token: token?.token || "",
        email: token?.userEmail || "",
      });
    },
    [resetPasswordMutation, token],
  );

  return (
    <div className="w-full space-y-16">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-semibold leading-[1.5em] lg:text-5xl">
          Welcome back, {token?.user.name?.split(" ")[0]}
        </h1>
        <p className="text-neutral-500 lg:text-lg">
          Please set your new password
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto w-full max-w-lg space-y-12 px-10"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="lg:text-base">New password</FormLabel>
                  <FormMessage className="text-xs lg:text-sm" />
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={isPasswordShown ? "text" : "password"}
                      disabled={isLoading}
                      {...field}
                      className="form-input placeholder:text-neutral-400"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsPasswordShown((prev) => !prev)}
                      className="absolute -right-10 top-1/2 -translate-y-1/2 text-neutral-400 hover:bg-transparent hover:text-neutral-500"
                    >
                      {isPasswordShown ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="lg:text-base">
                    Confirm password
                  </FormLabel>
                  <FormMessage className="text-xs lg:text-sm" />
                </div>
                <FormControl>
                  <Input
                    type="password"
                    disabled={isLoading}
                    {...field}
                    className="form-input placeholder:text-neutral-400"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="cta"
            disabled={isLoading}
            className="w-full"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
