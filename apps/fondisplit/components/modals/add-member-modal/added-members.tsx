import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { Avatar } from "@fondingo/ui/avatar";
import { X } from "@fondingo/ui/lucide";

export function AddedMembers() {
  const { addedMembers, toggleAddedMember } = useAddMemberModal();

  return (
    <ul className="flex items-center gap-x-6 px-8">
      {Object.values(addedMembers).map((friend) => (
        <li
          key={friend.id}
          className="flex select-none flex-col items-center justify-center"
        >
          <div
            role="button"
            onClick={() =>
              toggleAddedMember({
                id: friend.id,
                name: friend.name ?? "Unknown",
                email: friend.email,
                imageUrl: friend.imageUrl,
              })
            }
            className="relative"
          >
            <Avatar
              variant="xl"
              userName={friend.name}
              userImageUrl={friend.imageUrl}
            />
            <div className="absolute right-0 top-0 flex aspect-square w-fit items-center justify-center rounded-full border-2 border-white bg-neutral-400 p-1">
              <X className="h-3 w-3 text-white" />
            </div>
          </div>
          <span className="text-sm font-medium">{friend.name}</span>
        </li>
      ))}
    </ul>
  );
}
