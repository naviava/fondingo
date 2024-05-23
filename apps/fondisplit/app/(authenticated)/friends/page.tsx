import { SocialHeader } from "~/components/social-header";
import { FriendEntry } from "~/components/friend-entry";
import { ScrollArea } from "@fondingo/ui/scroll-area";

import { serverClient } from "~/lib/trpc/server-client";
import { OverallGrossBalance } from "~/components/overall-gross-balance";

export default async function FriendsPage() {
  const { friends: friendsInApp, tempFriends: friendsInGroups } =
    await serverClient.user.getFriends();

  return (
    // TODO: Add UI when there are no friends
    <>
      <SocialHeader />
      <OverallGrossBalance />
      <ScrollArea className="h-[80vh] md:h-[82vh] lg:h-[79vh]">
        <section className="flex flex-1 flex-col gap-y-8 px-4 pb-24">
          {!!friendsInApp.length && (
            <div className="space-y-6">
              {friendsInApp.map((friend) => (
                <FriendEntry
                  key={friend.id}
                  friendId={friend.id}
                  friendName={friend.name || "Unknown"}
                  imageUrl={friend.image || ""}
                />
              ))}
            </div>
          )}
          {!!friendsInGroups.length && (
            <div>
              <h4 className="text-muted-foreground font-semibold">
                Friends not on Fondi
              </h4>
              <div className="mt-4 space-y-4">
                {friendsInGroups.map((friend) => (
                  <FriendEntry
                    key={friend.id}
                    friendId={friend.id}
                    friendName={friend.name || "Unknown"}
                    hideDebts
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </ScrollArea>
    </>
  );
}
