"use client";

import { useRouter } from "next/navigation";
import { memo, useState } from "react";

import { Check, X } from "@fondingo/ui/lucide";
import { toast } from "@fondingo/ui/use-toast";
import { Avatar } from "@fondingo/ui/avatar";
import { Button } from "@fondingo/ui/button";

import { format } from "@fondingo/utils/date-fns";
import { trpc } from "~/lib/trpc/client";

interface IProps {
  requestId: string;
  fromId: string;
  fromName: string;
  createdAt: Date;
  imageUrl: string;
}

export const IncomingFriendRequest = memo(_IncomingFriendRequest);
function _IncomingFriendRequest({
  requestId,
  fromId,
  fromName,
  createdAt,
  imageUrl,
}: IProps) {
  const router = useRouter();
  const [onMutateSuccessMessage, setOnMutateSuccessMessage] = useState("");

  const utils = trpc.useUtils();
  const { mutate: handleAcceptFriendRequest, isPending: isAccepting } =
    trpc.user.acceptFriendRequest.useMutation({
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
        setOnMutateSuccessMessage("Accepted friend request");
        utils.user.getFriendRequests.invalidate();
        router.refresh();
      },
    });
  const { mutate: handleDeclineFriendRequest, isPending: isDeclining } =
    trpc.user.declineFriendRequest.useMutation({
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
        setOnMutateSuccessMessage("Declined friend request");
        utils.user.getFriendRequests.invalidate();
        router.refresh();
      },
    });

  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-center gap-x-4">
        <Avatar userName={fromName} userImageUrl={imageUrl} />
        <div>
          <p className="font-medium">{fromName}</p>
          <p className="text-xs font-semibold italic text-neutral-400">
            sent on {format(new Date(createdAt), "LLL d, yyyy")}
          </p>
        </div>
      </div>
      <div className="space-x-1">
        {!!onMutateSuccessMessage ? (
          <p className="text-xs font-medium italic text-neutral-400">
            {onMutateSuccessMessage}
          </p>
        ) : (
          <>
            <Button
              size="sm"
              variant="splitGhost"
              disabled={isAccepting || isDeclining}
              onClick={() => handleAcceptFriendRequest({ requestId, fromId })}
            >
              <Check />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isAccepting || isDeclining}
              onClick={() => handleDeclineFriendRequest({ requestId, fromId })}
              className="text-rose-600 hover:text-rose-600"
            >
              <X />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
