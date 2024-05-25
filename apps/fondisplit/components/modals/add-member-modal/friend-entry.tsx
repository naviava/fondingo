import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { Separator } from "@fondingo/ui/separator";
import { Avatar } from "@fondingo/ui/avatar";
import { Check } from "@fondingo/ui/lucide";
import { useMemo } from "react";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  friendId: string;
  friendEmail: string;
  imageUrl: string | null;
  friendName: string | null;
}

export function FriendEntry({
  imageUrl,
  friendId,
  friendName,
  friendEmail,
}: IProps) {
  const { addedMembers, toggleAddedMember } = useAddMemberModal();
  const isAdded = useMemo(
    () => !!addedMembers[friendId],
    [addedMembers, friendId],
  );

  return (
    <>
      <div
        role="button"
        onClick={() =>
          toggleAddedMember({
            id: friendId,
            name: friendName ?? "Unknown",
            email: friendEmail,
            imageUrl,
          })
        }
        className="flex items-center justify-between gap-x-4 px-4 py-1 hover:bg-neutral-200"
      >
        <div className="flex h-14 w-14 items-center justify-center">
          <Avatar variant="lg" userName={friendName} userImageUrl={imageUrl} />
        </div>
        <div className="flex-1 font-medium">
          <p className="text-base">{friendName}</p>
          <p className="text-sm text-neutral-400">{friendEmail}</p>
        </div>
        <div
          className={cn(
            "mr-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-neutral-300 transition",
            isAdded && "border-cta bg-cta",
          )}
        >
          {isAdded && <Check className="h-4 w-4 text-white" />}
        </div>
      </div>
      <Separator />
    </>
  );
}
