import { FriendEntry } from "~/components/friends-page/friend-entry";
import { SocialHeader } from "~/components/social-header";
import { ScrollArea } from "@fondingo/ui/scroll-area";

import { serverClient } from "~/lib/trpc/server-client";
import { OverallGrossBalance } from "~/components/overall-gross-balance";
import { FcRating } from "react-icons/fc";
import { IncomingFriendRequest } from "~/components/friends-page/incoming-friend-request";

export default async function FriendsPage() {
  const { friends: friendsInApp, tempFriends: friendsInGroups } =
    await serverClient.user.getFriends();

  const { receivedFriendRequests } =
    await serverClient.user.getFriendRequests();

  return (
    // TODO: Add UI when there are no friends
    <>
      <SocialHeader />
      <OverallGrossBalance />
      <ScrollArea className="h-[80vh] md:h-[82vh] lg:h-[79vh]">
        <section className="flex flex-1 flex-col gap-y-12 px-4 pb-24">
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
          {!!receivedFriendRequests.length && (
            <div>
              <h4 className="text-muted-foreground flex items-center font-semibold">
                <FcRating className="mr-2 h-6 w-6" />
                {`Incoming friend requests (${receivedFriendRequests.length})`}
              </h4>
              {receivedFriendRequests.map((request) => (
                <IncomingFriendRequest
                  key={request.id}
                  requestId={request.id}
                  fromId={request.fromId}
                  fromName={request.from.name || "Unknown"}
                  imageUrl={request.from.image || ""}
                  createdAt={request.createdAt}
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
