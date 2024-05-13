"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";
import { useCallback, useRef, useState } from "react";

import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { Search, UserPlus } from "@fondingo/ui/lucide";
import { Separator } from "@fondingo/ui/separator";
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

const formSchema = z.object({
  memberName: z.string().min(1, { message: "Name cannot be empty" }),
  email: z.string().email({ message: "Invalid email" }),
});

export function AddMemberModal() {
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

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log({ ...values, groupId });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideDefaultCloseButton className="px-0 py-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {isAddingContact ? (
              <Button
                variant="splitGhost"
                size="sm"
                onClick={() => {
                  form.reset();
                  setIsAddingContact(false);
                }}
                className="min-w-[5rem]"
              >
                {isAddingContact ? "Back" : "Cancel"}
              </Button>
            ) : (
              <Button
                variant="splitGhost"
                size="sm"
                onClick={onClose}
                className="min-w-[5rem]"
              >
                {isAddingContact ? "Back" : "Cancel"}
              </Button>
            )}
            <DialogTitle>Add group members</DialogTitle>
            {isAddingContact ? (
              <Button
                variant="splitGhost"
                size="sm"
                disabled={!isGroupManager}
                onClick={() => submitButtonRef.current?.click()}
                className="min-w-[5rem]"
              >
                Add
              </Button>
            ) : (
              <Button
                variant="splitGhost"
                size="sm"
                disabled={!isGroupManager}
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
                  <Input className="bg-neutral-200/90 pl-10 text-base font-medium" />
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
                              {...field}
                              className="focus-visible:border-b-cta h-6 rounded-none border-b-2 bg-transparent px-0 py-3 text-lg font-medium transition placeholder:font-medium placeholder:text-neutral-400/70"
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
                              {...field}
                              className="focus-visible:border-b-cta h-6 rounded-none border-b-2 bg-transparent px-0 py-3 text-lg font-medium transition placeholder:font-medium placeholder:text-neutral-400/70"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <button
                      ref={submitButtonRef}
                      type="submit"
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
