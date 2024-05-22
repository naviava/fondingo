import { FriendWithBalance } from "~/components/friend-entry";
import { SocialHeader } from "~/components/social-header";
import { ScrollArea } from "@fondingo/ui/scroll-area";

import { serverClient } from "~/lib/trpc/server-client";

export default async function FriendsPage() {
  const { friends: friendsInApp, tempFriends: friendsInGroups } =
    await serverClient.user.getFriends();

  return (
    // TODO: Add UI when there are no friends
    <>
      <SocialHeader />
      <ScrollArea className="h-[80vh] md:h-[82vh] lg:h-[79vh]">
        <section className="flex flex-1 flex-col gap-y-8 px-4 pb-24">
          {/* TODO: Change to friend in app */}
          {!!friendsInApp.length && (
            <div className="space-y-6">
              {friendsInApp.map((friend) => (
                <FriendWithBalance
                  friendId={friend.id}
                  friendName={friend.name || "Unknown"}
                  imageUrl={friend.image || ""}
                  hideDebts
                />
              ))}
            </div>
          )}
          <div>
            <h4 className="text-muted-foreground font-semibold">
              Friends not on Fondi
            </h4>
            <div className="mt-4 space-y-4">
              {friendsInGroups.map((friend) => (
                <FriendWithBalance
                  friendId={friend.id}
                  friendName={friend.name || "Unknown"}
                  hideDebts
                />
              ))}
            </div>
          </div>
        </section>
      </ScrollArea>
    </>
  );
}
