"use client";

import { useCallback, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { Eye, EyeOff } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
  FormDescription,
} from "@fondingo/ui/form";

import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";
import { toast } from "@fondingo/ui/use-toast";

const formSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: "Display name cannot be empty" })
    .max(20, { message: "Display name cannot be longer than 20 characters." }),
  email: z.string().email({ message: "Invalid email" }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(6, { message: "Password too short" }),
  confirmPassword: z.string(),
  phone: z
    .string()
    .regex(
      new RegExp(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/),
      { message: "Invalid phone number." },
    )
    .optional(),
});
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords do not match",
//   path: ["confirmPassword"],
// });

export function RegisterForm() {
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

  const { mutate: handleCreateNewUser } = trpc.user.createNewUser.useMutation({
    onError: ({ message }) =>
      toast({
        title: "Something went wrong",
        description: message,
      }),
    onSuccess: ({ toastTitle, toastDescription }) =>
      toast({
        title: toastTitle,
        description: toastDescription,
      }),
  });

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    handleCreateNewUser(values);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  "text-xs font-semibold md:text-sm",
                  hfont.className,
                )}
              >
                Display name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="ImAwesome123"
                  {...field}
                  className="auth-form-input placeholder:text-neutral-400"
                />
              </FormControl>
              <FormDescription className="text-xs italic text-neutral-500/90 md:text-sm">
                This will be your public name.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  "text-xs font-semibold md:text-sm",
                  hfont.className,
                )}
              >
                Email address
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="yourname@email.com"
                  {...field}
                  className="auth-form-input placeholder:text-neutral-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-x-2 md:gap-x-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel
                  className={cn(
                    "text-xs font-semibold md:text-sm",
                    hfont.className,
                  )}
                >
                  First name
                  <span className="ml-1 text-[11px] font-normal italic md:text-xs">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input {...field} className="auth-form-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel
                  className={cn(
                    "text-xs font-semibold md:text-sm",
                    hfont.className,
                  )}
                >
                  Last name
                  <span className="ml-1 text-[11px] font-normal italic md:text-xs">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input {...field} className="auth-form-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  "text-xs font-semibold md:text-sm",
                  hfont.className,
                )}
              >
                Phone number
                <span className="ml-1 text-[11px] font-normal italic md:text-xs">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input {...field} className="auth-form-input" />
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
              <FormLabel
                className={cn(
                  "text-xs font-semibold md:text-sm",
                  hfont.className,
                )}
              >
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={isPasswordShown ? "text" : "password"}
                    {...field}
                    className="auth-form-input pr-16"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsPasswordShown((prev) => !prev)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:bg-transparent hover:text-neutral-500"
                  >
                    {isPasswordShown ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={cn(
                  "text-xs font-semibold md:text-sm",
                  hfont.className,
                )}
              >
                Confirm password
              </FormLabel>
              <FormControl>
                <Input type="password" {...field} className="auth-form-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant="cta"
          type="submit"
          className={cn(
            "text w-full transition focus:scale-[0.98]",
            hfont.className,
          )}
        >
          Sign in
        </Button>
      </form>
    </Form>
  );
}
