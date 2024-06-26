"use client";

import { useCallback, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { toast } from "@fondingo/ui/use-toast";
import { AuthFormInput } from "./auth-form-input";
import { Button } from "@fondingo/ui/button";
import { Form } from "@fondingo/ui/form";

import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

const formSchema = z
  .object({
    displayName: z
      .string()
      .min(1, { message: "Cannot be empty" })
      .max(20, { message: "Max 20 characters." }),
    email: z.string().email({ message: "Invalid email" }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().min(6, { message: "Password too short" }),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(
        new RegExp(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}?$/),
        { message: "Invalid phone number." },
      )
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface IProps {
  disabled: boolean;
}

export function RegisterForm({ disabled }: IProps) {
  const [emailSent, setEmailSent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const { mutate: handleCreateNewUser, isPending } =
    trpc.user.createNewUser.useMutation({
      onError: ({ message }) =>
        toast({
          title: "Something went wrong",
          description: message,
        }),
      onSuccess: async ({ toastTitle, toastDescription }) => {
        setIsNavigating(true);
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        setEmailSent(true);
      },
    });

  const isLoading = useMemo(
    () => disabled || isPending || isNavigating,
    [disabled, isPending, isNavigating],
  );

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      handleCreateNewUser(values);
    },
    [handleCreateNewUser],
  );

  return (
    <>
      {emailSent && (
        <div className="space-y-4 text-center md:space-y-6">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Verification email sent
          </h2>
          <p className="text-balance leading-7 text-neutral-600 md:text-lg">
            Please check your email to verify your email address and start using
            FSplit.
          </p>
        </div>
      )}
      {!emailSent && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <AuthFormInput
              form={form}
              fieldName="displayName"
              label="Display name"
              placeholder="ImAwesome123"
              description="This will be your public name."
              disabled={isLoading}
            />
            <AuthFormInput
              form={form}
              fieldName="email"
              label="Email address"
              placeholder="yourname@email.com"
              disabled={isLoading}
            />
            <div className="flex items-center gap-x-2 md:gap-x-4">
              <AuthFormInput
                form={form}
                fieldName="firstName"
                label="First name"
                disabled={isLoading}
                forceFullWidth
                isOptional
              />
              <AuthFormInput
                form={form}
                fieldName="lastName"
                label="Last name"
                disabled={isLoading}
                forceFullWidth
                isOptional
              />
            </div>
            <AuthFormInput
              form={form}
              fieldName="phone"
              label="Phone number"
              disabled={isLoading}
              isOptional
            />
            <AuthFormInput
              form={form}
              fieldName="password"
              label="Password"
              type="password"
              disabled={isLoading}
              isPasswordShown={isPasswordShown}
              setIsPasswordShown={setIsPasswordShown}
            />
            <AuthFormInput
              form={form}
              type="password"
              fieldName="confirmPassword"
              label="Confirm password"
              disabled={isLoading}
            />
            <div>
              <Button
                variant="cta"
                type="submit"
                disabled={isLoading}
                className={cn(
                  "text mt-6 w-full transition focus:scale-[0.98]",
                  hfont.className,
                )}
              >
                Register & Sign in
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
