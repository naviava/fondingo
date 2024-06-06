import { serverClient } from "~/lib/trpc/server-client";
import { FcRating } from "react-icons/fc";

import { IncomingFriendRequest } from "~/components/friends-page/incoming-friend-request";
import { OverallGrossBalance } from "~/components/overall-gross-balance";
import { DynamicScrollArea } from "@fondingo/ui/dynamic-scroll-area";
import { FriendEntry } from "~/components/friends-page/friend-entry";
import { NoFriends } from "~/components/friends-page/no-friends";
import { SocialHeader } from "~/components/social-header";

export default async function FriendsPage() {
  const { friends: friendsInApp, tempFriends: friendsInGroups } =
    await serverClient.user.getFriends();

  const { receivedFriendRequests } =
    await serverClient.user.getFriendRequests();

  return (
    // TODO: Add UI when there are no friends
    <>
      <SocialHeader />
      <DynamicScrollArea>
        <OverallGrossBalance />
        <section className="flex flex-1 flex-col gap-y-12 px-4">
          {!friendsInApp.length ? (
            <NoFriends />
          ) : (
            <ul className="space-y-6">
              {friendsInApp.map((friend) => (
                <FriendEntry
                  key={friend.id}
                  friendId={friend.id}
                  friendName={friend.name || "Unknown"}
                  imageUrl={friend.image || ""}
                />
              ))}
            </ul>
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
                Friends not on FSplit
              </h4>
              <ul className="mt-4 space-y-4">
                {friendsInGroups.map((friend) => (
                  <FriendEntry
                    key={friend.id}
                    friendId={friend.id}
                    friendName={friend.name || "Unknown"}
                    hideDebts
                  />
                ))}
              </ul>
            </div>
          )}
        </section>
      </DynamicScrollArea>
    </>
  );
}
