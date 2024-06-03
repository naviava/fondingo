"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

import { useChangePasswordModal } from "@fondingo/store/use-change-password-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@fondingo/ui/use-toast";
import { useForm } from "react-hook-form";
import { trpc } from "~/lib/trpc/client";
import { z } from "@fondingo/utils/zod";

import { Separator } from "@fondingo/ui/separator";
import { Button } from "@fondingo/ui/button";
import { FormInput } from "./form-input";
import { Form } from "@fondingo/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fondingo/ui/dialog";

import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Cannot be empty" }),
    newPassword: z.string().min(6, { message: "Password too short" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function ChangePasswordModal() {
  const router = useRouter();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onClose } = useChangePasswordModal((state) => state);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    mutate: handleChangePassword,
    isPending,
    isSuccess,
  } = trpc.user.changePassword.useMutation({
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
      onClose();
      router.refresh();
    },
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (isPending || isSuccess) return;
      if (form.getValues("newPassword") === form.getValues("currentPassword"))
        return form.setError("newPassword", {
          message: "Cannot be the same as current password.",
        });
      handleChangePassword(values);
    },
    [form, isPending, isSuccess, handleChangePassword],
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        form.reset();
        onClose();
      }}
    >
      <DialogContent hideDefaultCloseButton className="px-0 py-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="ctaGhost"
              onClick={() => {
                form.reset();
                onClose();
              }}
              disabled={isPending || isSuccess}
              className="min-w-[5rem] text-sm md:text-base"
            >
              Close
            </Button>
            <DialogTitle
              className={cn("text-base md:text-lg", hfont.className)}
            >
              Change Password
            </DialogTitle>
            <Button
              size="sm"
              variant="ctaGhost"
              disabled={isPending || isSuccess}
              onClick={() => {
                submitButtonRef.current?.click();
              }}
              className="min-w-[5rem] text-sm md:text-base"
            >
              Submit
            </Button>
          </div>
        </DialogHeader>
        <Separator />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-4"
          >
            <FormInput
              form={form}
              fieldName="currentPassword"
              label="Current password"
              disabled={isPending || isSuccess}
              canReveal
            />
            <FormInput
              form={form}
              fieldName="newPassword"
              label="New password"
              disabled={isPending || isSuccess}
              canReveal
            />
            <FormInput
              form={form}
              fieldName="confirmPassword"
              label="Confirm password"
              disabled={isPending || isSuccess}
            />
            <button ref={submitButtonRef} type="submit" className="hidden" />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
