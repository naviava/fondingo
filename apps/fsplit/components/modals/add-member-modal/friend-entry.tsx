import { useAddMemberModal } from "@fondingo/store/fsplit";
import { Separator } from "@fondingo/ui/separator";
import { Avatar } from "@fondingo/ui/avatar";
import { Check } from "@fondingo/ui/lucide";
import { useMemo } from "react";
import { cn } from "@fondingo/ui/utils";
import { useParams } from "next/navigation";
import { trpc } from "~/lib/trpc/client";

interface IProps {
  friendId: string;
  friendEmail: string;
  imageUrl: string | null;
  friendName: string | null;
  disabled?: boolean;
}

export function FriendEntry({
  imageUrl,
  friendId,
  friendName,
  friendEmail,
  disabled = false,
}: IProps) {
  const params: { groupId: string } = useParams();
  const { data: group } = trpc.group.getGroupById.useQuery(params.groupId);
  const { addedMembers, toggleAddedMember } = useAddMemberModal();

  const isInGroup = useMemo(
    () => group?.members.map((member) => member.email).includes(friendEmail),
    [friendEmail, group?.members],
  );
  const isAdded = useMemo(
    () => !!addedMembers[friendId],
    [addedMembers, friendId],
  );

  return (
    <>
      <div
        role="button"
        onClick={() => {
          if (disabled || isInGroup) return;
          toggleAddedMember({
            id: friendId,
            name: friendName ?? "Unknown",
            email: friendEmail,
            imageUrl,
          });
        }}
        className={cn(
          "flex items-center justify-between gap-x-4 px-4 py-1",
          !disabled && !isInGroup && "hover:bg-neutral-200",
          (disabled || isInGroup) && "cursor-not-allowed",
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center">
          <Avatar variant="lg" userName={friendName} userImageUrl={imageUrl} />
        </div>
        <div className="flex-1 font-medium">
          <p
            className={cn(
              "text-left text-base",
              disabled || (isInGroup && "text-neutral-400"),
            )}
          >
            {friendName}
          </p>
          <p
            className={cn(
              "text-left text-sm text-neutral-400",
              isInGroup && "text-xs italic",
            )}
          >
            {isInGroup ? "Already in this group" : friendEmail}
          </p>
        </div>
        <div
          className={cn(
            "mr-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-neutral-300 transition",
            isInGroup && "bg-neutral-300",
            isAdded && "border-cta bg-cta",
          )}
        >
          {(isAdded || isInGroup) && <Check className="h-4 w-4 text-white" />}
        </div>
      </div>
      <Separator />
    </>
  );
}
