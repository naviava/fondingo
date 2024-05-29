"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useAddFriendModal } from "@fondingo/store/fsplit";
import { useDebounceValue } from "@fondingo/utils/hooks";

import { Separator } from "@fondingo/ui/separator";
import { toast } from "@fondingo/ui/use-toast";
import { Avatar } from "@fondingo/ui/avatar";
import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Loader,
  Search,
  UserPlus,
} from "@fondingo/ui/lucide";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fondingo/ui/dialog";

import { trpc } from "~/lib/trpc/client";

export function AddFriendModal() {
  const router = useRouter();
  const { isOpen, onClose } = useAddFriendModal();
  const [debouncedValue, setValue] = useDebounceValue("", 500);
  const { data: foundUsers } = trpc.user.findUsers.useQuery(debouncedValue);

  const utils = trpc.useUtils();
  const { data } = trpc.user.getFriendRequests.useQuery();
  const sentFriendRequestIds = useMemo(
    () => data?.sentFriendRequests.map((req) => req.toId),
    [data],
  );
  const receivedFriendRequestIds = useMemo(
    () => data?.receivedFriendRequests.map((req) => req.fromId),
    [data],
  );

  const { mutate: handleFriendRequest, isPending } =
    trpc.user.sendFriendRequest.useMutation({
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
        utils.user.getFriendRequests.invalidate();
        router.refresh();
      },
    });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideDefaultCloseButton className="px-0 py-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="splitGhost"
              size="sm"
              disabled={isPending}
              onClick={onClose}
              className="min-w-[5rem]"
            >
              Close
            </Button>
            <DialogTitle>Add friend</DialogTitle>
            <Button
              variant="splitGhost"
              size="sm"
              disabled={isPending}
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
                disabled={isPending}
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
        <ul className="mx-auto grid w-[90%] select-none grid-cols-1 gap-x-4 gap-y-4 px-4 md:w-full md:grid-cols-2">
          {foundUsers?.map((user) => (
            <li
              key={user?.id}
              className="flex cursor-pointer items-center justify-between gap-x-2 rounded-md px-2 py-1 transition hover:bg-neutral-100"
            >
              <div className="flex items-center gap-x-2">
                <Avatar
                  variant="sm"
                  userName={user?.name}
                  userImageUrl={user?.image}
                />
                <p className="line-clamp-1 text-sm font-medium">{user?.name}</p>
              </div>
              {!!user?.id &&
                (sentFriendRequestIds?.includes(user.id) ? (
                  <div className="text-muted-foreground flex items-center text-xs font-medium italic">
                    Sent
                    <ArrowRight className="h-3 w-3 md:hidden" />
                  </div>
                ) : receivedFriendRequestIds?.includes(user.id) ? (
                  <div className="text-muted-foreground flex items-center text-xs font-medium italic">
                    <ArrowLeft className="h-3 w-3 md:hidden" />
                    Received
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="splitGhost"
                    disabled={isPending}
                    onClick={() => handleFriendRequest(user?.id || "")}
                    className="px-0 text-sm"
                  >
                    {isPending ? (
                      <Loader className="animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="mr-1 h-4 w-4" />
                        <span>Add</span>
                      </>
                    )}
                  </Button>
                ))}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
