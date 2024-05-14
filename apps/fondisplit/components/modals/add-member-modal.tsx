"use client";

import { useCallback, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { Loader, Search, UserPlus } from "@fondingo/ui/lucide";
import { Separator } from "@fondingo/ui/separator";
import { useToast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@fondingo/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@fondingo/ui/form";

import { trpc } from "~/lib/trpc/client";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  memberName: z.string().min(1, { message: "Name cannot be empty" }),
  email: z.string().email({ message: "Invalid email" }),
});

export function AddMemberModal() {
  const router = useRouter();
  const { toast } = useToast();

  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const { groupId, isGroupManager, isOpen, onClose } = useAddMemberModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberName: "",
      email: "",
    },
  });

  const { mutate: handleAddMember, isPending } =
    trpc.group.addMember.useMutation({
      onError: ({ message }) =>
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: message,
        }),
      onSuccess: ({ toastTitle, toastDescription }) => {
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        setIsAddingContact(false);
        form.reset();
        onClose();
        router.refresh();
      },
    });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      handleAddMember({ ...values, groupId });
    },
    [groupId, handleAddMember],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideDefaultCloseButton className="px-0 py-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {isAddingContact ? (
              <Button
                variant="splitGhost"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  form.reset();
                  setIsAddingContact(false);
                }}
                className="min-w-[5rem]"
              >
                Back
              </Button>
            ) : (
              <Button
                variant="splitGhost"
                size="sm"
                disabled={isPending}
                onClick={onClose}
                className="min-w-[5rem]"
              >
                Cancel
              </Button>
            )}
            <DialogTitle>Add group members</DialogTitle>
            {isAddingContact ? (
              <Button
                variant="splitGhost"
                size="sm"
                disabled={!isGroupManager || isPending}
                onClick={() => submitButtonRef.current?.click()}
                className="min-w-[5rem]"
              >
                {isPending ? (
                  <Loader className="h-6 w-6 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            ) : (
              <Button
                variant="splitGhost"
                size="sm"
                disabled={!isGroupManager || isPending}
                onClick={onClose}
                className="min-w-[5rem]"
              >
                Done
              </Button>
            )}
          </div>
          {!isGroupManager && (
            <DialogDescription className="p-6 text-center">
              Only group managers can add members to the group.
            </DialogDescription>
          )}
          {isGroupManager && (
            <div className="space-y-4">
              {!isAddingContact && (
                <div className="relative px-4">
                  {/* TODO: Add search friends functionality */}
                  <Input
                    disabled={isPending}
                    className="bg-neutral-200/90 pl-10 text-base font-medium"
                  />
                  <Search
                    size={20}
                    className="text-muted-foreground absolute left-6 top-1/2 -translate-y-1/2"
                  />
                </div>
              )}
              <Separator />
              {!isAddingContact && (
                <div
                  role="button"
                  onClick={() => setIsAddingContact(true)}
                  className="flex select-none items-center px-4"
                >
                  <UserPlus className="mr-4" />
                  <span className="text-base font-medium">
                    Add a new contact to Fondisplit
                  </span>
                </div>
              )}
              {isAddingContact && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 px-4"
                  >
                    <FormField
                      control={form.control}
                      name="memberName"
                      // @ts-ignore
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start justify-center">
                          <FormLabel className="text-start font-semibold">
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="off"
                              disabled={isPending}
                              {...field}
                              className="form-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      // @ts-ignore
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-start justify-center">
                          <FormLabel className="text-start font-semibold">
                            Email address
                          </FormLabel>
                          <FormControl>
                            <Input
                              autoComplete="off"
                              disabled={isPending}
                              {...field}
                              className="form-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <button
                      ref={submitButtonRef}
                      type="submit"
                      disabled={isPending}
                      className="hidden"
                    />
                  </form>
                </Form>
              )}
            </div>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
