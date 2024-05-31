"use client";

import { useCallback, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import { Eye, EyeOff } from "@fondingo/ui/lucide";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@fondingo/ui/form";

import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  displayName: z.string().min(1, { message: "Display name cannot be empty" }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6, { message: "Password too short" }),
  confirmPassword: z.string(),
});

export function RegisterForm() {
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log(values);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={cn(hfont.className)}>
                Email address
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="yourname@email.com"
                  {...field}
                  className="border-2 border-white bg-neutral-100/70"
                />
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
              <FormLabel className={cn(hfont.className)}>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={isPasswordShown ? "text" : "password"}
                    placeholder="******"
                    {...field}
                    className="border-2 border-white bg-neutral-100/70 pr-16"
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
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="link"
            className="-mt-4 text-neutral-500"
          >
            Forgot password?
          </Button>
        </div>
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
