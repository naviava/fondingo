"use client";

import { useMemo } from "react";
import { trpc } from "~/lib/trpc/client";
import { FriendEntry } from "./friend-entry";
import { ScrollArea } from "@fondingo/ui/scroll-area";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  disabled?: boolean;
}

export function FriendsList({ disabled }: IProps) {
  const { data: fetchedfriends } = trpc.user.getFriends.useQuery();
  const friends = useMemo(() => fetchedfriends?.friends, [fetchedfriends]);
  const tempFriends = useMemo(
    () => fetchedfriends?.tempFriends,
    [fetchedfriends],
  );
  const totalLength = useMemo(
    () => (friends?.length ?? 0) + (tempFriends?.length ?? 0),
    [friends?.length, tempFriends?.length],
  );

  return (
    <section className="select-none">
      <ScrollArea className={cn(totalLength > 4 && "h-[35vh]")}>
        {!!friends && !!friends.length && (
          <h4 className="mb-3 px-4 text-left text-base font-semibold">
            Friends on FSplit
          </h4>
        )}
        {!!friends &&
          !!friends.length &&
          friends.map((friend) => (
            <FriendEntry
              key={friend.id}
              friendId={friend.id}
              imageUrl={friend.image}
              friendName={friend.name}
              friendEmail={friend.email}
              disabled={disabled}
            />
          ))}
        {!!tempFriends && !!tempFriends.length && (
          <h4 className="my-3 px-4 text-left text-base font-semibold">
            Others
          </h4>
        )}
        {!!tempFriends &&
          !!tempFriends.length &&
          tempFriends.map((friend) => (
            <FriendEntry
              key={friend.id}
              imageUrl=""
              friendId={friend.id}
              friendName={friend.name}
              friendEmail={friend.email}
              disabled={disabled}
            />
          ))}
      </ScrollArea>
    </section>
  );
}
