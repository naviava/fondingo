"use client";

import { useMemo } from "react";
import { trpc } from "~/lib/trpc/client";
import { FriendEntry } from "./friend-entry";

interface IProps {
  disabled?: boolean;
}

export function FriendsList({ disabled }: IProps) {
  const { data: fetchedfriends } = trpc.user.getFriends.useQuery();
  const friends = useMemo(() => fetchedfriends?.friends, [fetchedfriends]);

  return (
    <section className="select-none">
      <h4 className="mb-2 px-4 text-base font-semibold">
        Friends on Fondisplit
      </h4>
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
    </section>
  );
}
