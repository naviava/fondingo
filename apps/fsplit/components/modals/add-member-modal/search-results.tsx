import { ScrollArea } from "@fondingo/ui/scroll-area";
import { FriendEntry } from "./friend-entry";
import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";
import { useMemo } from "react";

interface IProps {
  searchTerm: string;
}

export function SearchResults({ searchTerm }: IProps) {
  const { data: searchResults } = trpc.user.findFriends.useQuery(searchTerm);
  const friends = useMemo(() => searchResults?.friends, [searchResults]);
  const tempFriends = useMemo(
    () => searchResults?.tempFriends,
    [searchResults],
  );
  const totalLength = useMemo(
    () => (friends?.length ?? 0) + (tempFriends?.length ?? 0),
    [friends?.length, tempFriends?.length],
  );

  return (
    <section className="select-none">
      <h4 className="mb-3 px-4 text-left text-base font-semibold">
        Search results
      </h4>
      <ScrollArea className={cn(totalLength > 5 && "h-[35vh]")}>
        {!!friends &&
          !!friends.length &&
          friends.map((friend) => (
            <FriendEntry
              key={friend.id}
              friendId={friend.id}
              imageUrl={friend.image}
              friendName={friend.name}
              friendEmail={friend.email}
              disabled={false}
            />
          ))}
        {!!tempFriends &&
          !!tempFriends.length &&
          tempFriends.map((friend) => (
            <FriendEntry
              key={friend.id}
              friendId={friend.id}
              imageUrl=""
              friendName={friend.name}
              friendEmail={friend.email}
              disabled={false}
            />
          ))}
      </ScrollArea>
    </section>
  );
}
