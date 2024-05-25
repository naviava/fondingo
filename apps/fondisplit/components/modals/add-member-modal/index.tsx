"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { trpc } from "~/lib/trpc/client";
import { z } from "@fondingo/utils/zod";

import { Dialog, DialogContent, DialogHeader } from "@fondingo/ui/dialog";
import { Search, UserPlus } from "@fondingo/ui/lucide";
import { Separator } from "@fondingo/ui/separator";
import { useToast } from "@fondingo/ui/use-toast";
import { AddedMembers } from "./added-members";
import { FriendsList } from "./friends-list";
import { Input } from "@fondingo/ui/input";
import { Header } from "./header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@fondingo/ui/form";

const formSchema = z.object({
  memberName: z.string().min(1, { message: "Name cannot be empty" }),
  email: z.string().email({ message: "Invalid email" }),
});

export function AddMemberModal() {
  const router = useRouter();
  const { toast } = useToast();

  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const { groupId, isOpen, onClose } = useAddMemberModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberName: "",
      email: "",
    },
  });

  const utils = trpc.useUtils();
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
        utils.group.getGroupById.invalidate();
        utils.group.getMembers.invalidate();
        utils.group.getGroups.invalidate();
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
          <Header
            form={form}
            disabled={isPending}
            isAddingContact={isAddingContact}
            submitButtonRef={submitButtonRef}
            setIsAddingContact={setIsAddingContact}
          />
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
            <AddedMembers />
            <Separator />
            {!isAddingContact && (
              <div
                role="button"
                onClick={() => setIsAddingContact(true)}
                className="flex select-none items-center px-4 py-3 hover:bg-neutral-200"
              >
                <UserPlus className="mr-4" />
                <span className="text-base font-medium">
                  Add a new contact to Fondisplit
                </span>
              </div>
            )}
            {}
            {!isAddingContact ? (
              <FriendsList />
            ) : (
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
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}