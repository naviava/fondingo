"use client";

import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { Search, UserPlus } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@fondingo/ui/dialog";
import { Separator } from "@fondingo/ui/separator";
import { useState } from "react";

export function AddMemberModal() {
  const { groupId, isGroupManager, isOpen, onClose } = useAddMemberModal();

  const [isAddingContact, setIsAddingContact] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideDefaultCloseButton className="px-0 py-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="splitGhost"
              size="sm"
              onClick={
                isAddingContact ? () => setIsAddingContact(false) : onClose
              }
              className="min-w-[5rem]"
            >
              Cancel
            </Button>
            <DialogTitle>Add group members</DialogTitle>
            {isAddingContact ? (
              <Button
                variant="splitGhost"
                size="sm"
                disabled={!isGroupManager}
                className="min-w-[5rem]"
              >
                Add
              </Button>
            ) : (
              <Button
                variant="splitGhost"
                size="sm"
                disabled={!isGroupManager}
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
            </div>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
