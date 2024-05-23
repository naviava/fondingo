"use client";

import { useAddFriendModal } from "@fondingo/store/fondisplit";
import { useDebounceValue } from "@fondingo/utils/hooks";

import { Separator } from "@fondingo/ui/separator";
import { Search } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fondingo/ui/dialog";
import { trpc } from "~/lib/trpc/client";

export function AddFriendModal() {
  const [debouncedValue, setValue] = useDebounceValue("", 500);
  const { isOpen, onClose } = useAddFriendModal();

  const { data: foundUsers } = trpc.user.findUsers.useQuery(debouncedValue);

  console.log(foundUsers);

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
            <DialogTitle>Add friend</DialogTitle>
            <Button
              variant="splitGhost"
              size="sm"
              onClick={onClose}
              className="min-w-[5rem]"
            >
              Done
            </Button>
          </div>
          <div className="space-y-4">
            <div className="relative px-4">
              <Input
                type="text"
                defaultValue={debouncedValue}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search by email or phone number"
                className="bg-neutral-200/90 pl-10 text-base font-medium placeholder:text-sm placeholder:font-medium"
              />
              <Search
                size={20}
                className="text-muted-foreground absolute left-6 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>
        </DialogHeader>
        <Separator />
        {foundUsers?.map((user) => <div key={user?.id}>{user?.email}</div>)}
      </DialogContent>
    </Dialog>
  );
}
