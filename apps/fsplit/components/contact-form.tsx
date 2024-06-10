"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { Textarea } from "@fondingo/ui/textarea";
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
import { Loader } from "@fondingo/ui/lucide";

const formSchema = z.object({
  fullName: z
    .string()
    .min(1, { message: "Cannot be empty" })
    .max(50, { message: "Too long" }),
  email: z.string().email({ message: "Invalid email address" }),
  message: z
    .string()
    .min(10, { message: "Too short" })
    .max(5000, { message: "Too long" }),
});

export function ContactForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      message: "",
    },
  });

  const contactUsMutation = trpc.misc.contactUs.useMutation({
    onError: ({ message }) =>
      toast({
        title: "Something went wrong",
        description: message,
      }),
    onSuccess: ({ toastTitle, toastDescription }) => {
      form.reset();
      toast({
        title: toastTitle,
        description: toastDescription,
      });
      router.push("/");
      router.refresh();
    },
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      contactUsMutation.mutate(values);
    },
    [contactUsMutation],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-8">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="tracking-wide text-neutral-600 lg:text-base">
                  Full Name
                </FormLabel>
                <FormMessage className="text-xs lg:text-sm" />
              </div>
              <FormControl>
                <Input
                  placeholder="What's your full name?"
                  disabled={contactUsMutation.isPending}
                  {...field}
                  className="placeholder:text-neutral-400 lg:text-base"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="tracking-wide text-neutral-600 lg:text-base">
                  Email address
                </FormLabel>
                <FormMessage className="text-xs lg:text-sm" />
              </div>
              <FormControl>
                <Input
                  type="email"
                  placeholder="yourname@example.com"
                  disabled={contactUsMutation.isPending}
                  {...field}
                  className="placeholder:text-neutral-400 lg:text-base"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="tracking-wide text-neutral-600 lg:text-base">
                  Message
                </FormLabel>
                <FormMessage className="text-xs lg:text-sm" />
              </div>
              <FormControl>
                <Textarea
                  disabled={contactUsMutation.isPending}
                  placeholder="Write your message here..."
                  {...field}
                  className="h-[10rem] resize-none placeholder:text-neutral-400 lg:text-base"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          variant="cta"
          disabled={contactUsMutation.isPending}
          className="w-full tracking-wide lg:text-lg"
        >
          {contactUsMutation.isPending ? (
            <Loader className="h-5 w-5 animate-spin md:h-6 lg:w-6" />
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}
