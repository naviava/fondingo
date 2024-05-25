"use client";

import { Dispatch, RefObject, SetStateAction } from "react";

import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { UseFormReturn } from "react-hook-form";

import { DialogTitle } from "@fondingo/ui/dialog";
import { Button } from "@fondingo/ui/button";
import { Loader } from "@fondingo/ui/lucide";

interface IProps {
  disabled?: boolean;
  isAddingContact: boolean;
  submitButtonRef: RefObject<HTMLButtonElement>;
  setIsAddingContact: Dispatch<SetStateAction<boolean>>;
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
  isAddingContact,
  submitButtonRef,
  disabled = false,
  setIsAddingContact,
}: IProps) {
  const { onClose } = useAddMemberModal();

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
          onClick={() => console.log("Submitted")}
          className="min-w-[5rem]"
        >
          Done
        </Button>
      )}
    </div>
  );
}
