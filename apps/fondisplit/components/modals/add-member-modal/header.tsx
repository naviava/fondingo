"use client";

import { Dispatch, RefObject, SetStateAction, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { UseFormReturn } from "react-hook-form";

import { DialogTitle } from "@fondingo/ui/dialog";
import { toast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { Loader } from "@fondingo/ui/lucide";
import { trpc } from "~/lib/trpc/client";

interface IProps {
  groupId: string;
  disabled?: boolean;
  isAddingContact: boolean;
  submitButtonRef: RefObject<HTMLButtonElement>;
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
  setIsAddingContact,
  setIsPendingAddMultiple,
}: IProps) {
  const router = useRouter();
  const { addedMembers, onClose } = useAddMemberModal();
  const submissionData = useMemo(
    () =>
      Object.values(addedMembers).map((member) => ({
        id: member.id,
        name: member.name || "",
        email: member.email,
      })),
    [addedMembers],
  );

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
        router.refresh();
        onClose();
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
          variant="splitGhost"
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
          variant="splitGhost"
          size="sm"
          disabled={disabled}
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
          disabled={disabled}
          onClick={() => submitButtonRef.current?.click()}
          className="min-w-[5rem]"
        >
          {disabled ? <Loader className="h-6 w-6 animate-spin" /> : "Add"}
        </Button>
      ) : (
        <Button
          variant="splitGhost"
          size="sm"
          disabled={disabled}
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
