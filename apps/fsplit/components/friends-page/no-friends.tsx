import Image from "next/image";

export function NoFriends() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src="images/empty-friends-list.svg"
        alt="No friends"
        width={400}
        height={400}
        className="object-cover"
      />
      <p className="text-center text-sm text-neutral-400">
        You don't have any friends yet.
        <br />
        Click on "Add friend" to search and add friends.
      </p>
    </div>
  );
}
