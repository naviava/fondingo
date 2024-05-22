import { IndianRupee } from "@fondingo/ui/lucide";
import { Avatar } from "@fondingo/ui/avatar";
import { Button } from "@fondingo/ui/button";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  friendId: string;
  friendName: string;
  imageUrl?: string;
  hideDebts?: boolean;
}

export function FriendWithBalance({
  friendId,
  friendName,
  imageUrl,
  hideDebts,
}: IProps) {
  // TODO: Handle logic for these variables
  const isInDebt = false;
  const amount = 0;

  return (
    <div className="flex items-center gap-x-4">
      <div className="flex flex-1 items-center gap-x-3">
        <Avatar userName={friendName} userImageUrl={imageUrl || ""} />
        <p className="line-clamp-1 font-medium">{friendName}</p>
      </div>
      <div className="flex flex-col items-end justify-center">
        {hideDebts ? (
          <Button type="button" variant="splitGhost" size="sm">
            Invite
          </Button>
        ) : amount === 0 ? (
          <p className="text-xs font-medium md:text-sm">all settled up</p>
        ) : (
          <>
            <p className="text-xs font-medium md:text-sm">
              {isInDebt ? "you owe" : "owes you"}
            </p>
            <div
              className={cn(
                "flex items-center",
                isInDebt ? "text-rose-700" : "text-cta",
              )}
            >
              <IndianRupee className="h-4 w-4" />
              <span className="font-semibold">{(amount / 100).toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
