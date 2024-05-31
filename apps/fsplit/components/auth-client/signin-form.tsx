"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
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
import { Eye, EyeOff } from "@fondingo/ui/lucide";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@fondingo/ui/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password too short" }),
});

interface IProps {}

export function SigninForm({}: IProps) {
  const router = useRouter();
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    await signIn("credentials", {
      ...values,
      redirect: false,
    }).then((res) => {
      if (res?.ok) router.refresh();
      else
        toast({
          title: "Sign in failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
    });
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={cn("font-semibold", hfont.className)}>
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={cn("font-semibold", hfont.className)}>
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={isPasswordShown ? "text" : "password"}
                    placeholder="******"
                    {...field}
                    className="auth-form-input pr-16 placeholder:text-neutral-400"
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
