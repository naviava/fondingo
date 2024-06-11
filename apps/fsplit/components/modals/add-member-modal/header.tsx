"use client";

import { Dispatch, RefObject, SetStateAction, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAddMemberModal } from "@fondingo/store/fsplit";
import { UseFormReturn } from "react-hook-form";
import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

import { DialogTitle } from "@fondingo/ui/dialog";
import { toast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { Loader } from "@fondingo/ui/lucide";

interface IProps {
  groupId: string;
  disabled?: boolean;
  isAddingContact: boolean;
  submitButtonRef: RefObject<HTMLButtonElement>;
  setSearchTerm: (value: string) => void;
  setIsAddingContact: Dispatch<SetStateAction<boolean>>;
  setIsPendingAddMultiple: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<
    {
      memberName: string;
      email: string;
    },
    any,
    undefined
  >;
}

export function Header({
  form,
  groupId,
  isAddingContact,
  submitButtonRef,
  disabled = false,
  setSearchTerm,
  setIsAddingContact,
  setIsPendingAddMultiple,
}: IProps) {
  const router = useRouter();
  const { addedMembers, clearAddedMembers, onClose } = useAddMemberModal();
  const submissionData = useMemo(
    () =>
      Object.values(addedMembers).map((member) => ({
        id: member.id,
        name: member.name || "",
        email: member.email,
      })),
    [addedMembers],
  );

  const utils = trpc.useUtils();
  const { mutate: handleAddMembers, isPending } =
    trpc.group.addMultipleMembers.useMutation({
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
        utils.group.getGroupById.invalidate();
        utils.group.getMembers.invalidate();
        utils.group.getGroups.invalidate();
        setIsAddingContact(false);
        clearAddedMembers();
        setSearchTerm("");
        form.reset();
        onClose();
        router.refresh();
      },
    });

  useEffect(
    () => setIsPendingAddMultiple(isPending),
    [isPending, setIsPendingAddMultiple],
  );

  return (
    <div className="flex items-center justify-between">
      {isAddingContact ? (
        <Button
          variant="ctaGhost"
          size="sm"
          disabled={disabled}
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
          variant="ctaGhost"
          size="sm"
          disabled={disabled}
          onClick={onClose}
          className="min-w-[5rem]"
        >
          Cancel
        </Button>
      )}
      <DialogTitle className={cn("text-base md:text-lg", hfont.className)}>
        Add group members
      </DialogTitle>
      {isAddingContact ? (
        <Button
          variant="ctaGhost"
          size="sm"
          disabled={disabled}
          onClick={() => submitButtonRef.current?.click()}
          className="min-w-[5rem]"
        >
          {disabled ? <Loader className="h-6 w-6 animate-spin" /> : "Add"}
        </Button>
      ) : (
        <Button
          variant="ctaGhost"
          size="sm"
          disabled={disabled || !Object.keys(addedMembers).length}
          onClick={() =>
            handleAddMembers({
              groupId,
              newMembers: submissionData,
            })
          }
          className="min-w-[5rem]"
        >
          Done
        </Button>
      )}
    </div>
  );
}
