"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useEditUserModal } from "@fondingo/store/fsplit";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@fondingo/ui/use-toast";
import { useUtils } from "~/hooks/use-utils";
import { useForm } from "react-hook-form";
import { trpc } from "~/lib/trpc/client";
import { z } from "@fondingo/utils/zod";

import { Separator } from "@fondingo/ui/separator";
import { Button } from "@fondingo/ui/button";
import { FormInput } from "./form-input";
import { Form } from "@fondingo/ui/form";
import { X } from "@fondingo/ui/lucide";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fondingo/ui/dialog";

import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

const formSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters long." })
    .max(20, { message: "Display name cannot be longer than 20 characters." }),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z
    .string()
    .regex(
      new RegExp(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}?$/),
      { message: "Invalid phone number." },
    )
    .optional()
    .or(z.literal("")),
});

export function EditUserModal() {
  const router = useRouter();
  const { invalidateUserQueries } = useUtils();
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const { isOpen, onClose } = useEditUserModal((state) => state);
  const { data: user } = trpc.user.getAuthProfile.useQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user?.name || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    },
  });

  const { mutate: handleEditProfile, isPending } =
    trpc.user.editProfile.useMutation({
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
        invalidateUserQueries();
        router.refresh();
      },
    });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (
        form.getValues("displayName") === user?.name &&
        form.getValues("email") === user.email &&
        form.getValues("firstName") === user.firstName &&
        form.getValues("lastName") === user.lastName &&
        form.getValues("phone") === user.phone
      ) {
        return onClose();
      }
      handleEditProfile(values);
    },
    [handleEditProfile, onClose, user, form],
  );

  useEffect(() => {
    form.reset({
      displayName: user?.name || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    });
    () => form.reset();
  }, [
    user?.name,
    user?.email,
    user?.firstName,
    user?.lastName,
    user?.phone,
    form,
  ]);

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
              disabled={isPending}
              className="min-w-[5rem] text-sm md:text-base"
            >
              Close
            </Button>
            <DialogTitle
              className={cn("text-base md:text-lg", hfont.className)}
            >
              Edit account details
            </DialogTitle>
            <Button
              size="sm"
              variant="ctaGhost"
              disabled={isPending}
              onClick={() => {
                submitButtonRef.current?.click();
              }}
              className="min-w-[5rem] text-sm md:text-base"
            >
              Save
            </Button>
          </div>
        </DialogHeader>
        <Separator />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 px-4"
          >
            <div className="flex items-center justify-between">
              <FormInput
                form={form}
                fieldName="displayName"
                label="Display Name"
                placeholder="ImAwesome123"
                disabled={isPending}
                description="This is your public name."
                showError
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  form.reset({
                    displayName: user?.name || "",
                    firstName: user?.firstName || "",
                    lastName: user?.lastName || "",
                    phone: user?.phone || "",
                  })
                }
                className="text-rose-600 hover:bg-transparent hover:text-rose-600"
              >
                <X className="mr-1 h-4 w-4" />
                Reset
              </Button>
            </div>
            <FormInput
              form={form}
              label="Email"
              fieldName="email"
              placeholder="yourname@email.com"
              disabled={isPending}
              value={user?.email}
            />
            <div className="flex items-center gap-x-6">
              <FormInput
                isOptional
                form={form}
                fieldName="firstName"
                label="First name"
                disabled={isPending}
              />
              <FormInput
                isOptional
                form={form}
                fieldName="lastName"
                label="Last name"
                disabled={isPending}
              />
            </div>
            <FormInput
              isOptional
              form={form}
              fieldName="phone"
              label="Phone number"
              disabled={isPending}
              showError
            />
            <button ref={submitButtonRef} type="submit" className="hidden">
              Submit
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
