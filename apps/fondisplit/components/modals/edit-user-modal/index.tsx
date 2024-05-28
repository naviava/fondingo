"use client";

import { useCallback, useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { useEditUserModal } from "@fondingo/store/fondisplit";
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

import { trpc } from "~/lib/trpc/client";

const formSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters long." })
    .max(50, { message: "Display name cannot be longer than 50 characters." }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z
    .string()
    .regex(
      new RegExp(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/),
      { message: "Invalid phone number." },
    )
    .optional(),
});

export function EditUserModal() {
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const { isOpen, displayName, firstName, lastName, phone, onClose } =
    useEditUserModal((state) => state);
  const { data: user } = trpc.user.getAuthProfile.useQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: displayName,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
    },
  });

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log(values);
  }, []);

  useEffect(() => {
    form.reset({
      displayName: displayName,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
    });
  }, [displayName, firstName, lastName, phone, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideDefaultCloseButton className="px-0 py-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="splitGhost"
              size="sm"
              onClick={onClose}
              className="min-w-[5rem]"
            >
              Close
            </Button>
            <DialogTitle>Edit account details</DialogTitle>
            <Button
              variant="splitGhost"
              size="sm"
              onClick={() => {
                submitButtonRef.current?.click();
              }}
              className="min-w-[5rem]"
            >
              Save
            </Button>
          </div>
        </DialogHeader>
        <Separator />
        {/* <ScrollArea className="h-[40vh]"> */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 px-4"
          >
            <FormInput
              form={form}
              fieldName="displayName"
              label="Display Name"
              placeholder={`${user?.name?.split(" ")[0]}123`}
              description="This is your public name."
              showError
            />
            <FormInput
              form={form}
              fieldName="email"
              label="Email"
              placeholder="yourname@email.com"
              value={user?.email}
            />
            <div className="flex items-center gap-x-6">
              <FormInput
                isOptional
                form={form}
                fieldName="firstName"
                label="First name"
              />
              <FormInput
                isOptional
                form={form}
                fieldName="lastName"
                label="Last name"
              />
            </div>
            <FormInput
              isOptional
              form={form}
              fieldName="phone"
              label="Phone number"
              showError
            />
            <button ref={submitButtonRef} type="submit" className="hidden">
              Submit
            </button>
          </form>
        </Form>
        {/* </ScrollArea> */}
      </DialogContent>
    </Dialog>
  );
}
