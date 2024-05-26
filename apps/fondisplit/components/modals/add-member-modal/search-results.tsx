import { ScrollArea } from "@fondingo/ui/scroll-area";
import { FriendEntry } from "./friend-entry";
import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  searchTerm: string;
}

export function SearchResults({ searchTerm }: IProps) {
  const { data: searchResults } = trpc.user.findFriends.useQuery(searchTerm);

  return (
    <section className="select-none">
      <h4 className="mb-3 px-4 text-left text-base font-semibold">
        Search results
      </h4>
      <ScrollArea
        className={cn(
          !!searchResults?.friends &&
            searchResults?.friends?.length > 5 &&
            "h-[40vh]",
        )}
      >
        {!!searchResults &&
          !!searchResults.friends.length &&
          searchResults.friends.map((friend) => (
            <FriendEntry
              key={friend.id}
              friendId={friend.id}
              imageUrl={friend.image}
              friendName={friend.name}
              friendEmail={friend.email}
              disabled={false}
            />
          ))}
      </ScrollArea>
    </section>
  );
}
