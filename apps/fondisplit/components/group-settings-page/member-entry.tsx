import { currencyIconMap } from "@fondingo/ui/constants";
import { serverClient } from "~/lib/trpc/server-client";
import { Avatar } from "@fondingo/ui/avatar";
import { CurrencyCode } from "@fondingo/db-split";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  groupId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  currency: CurrencyCode;
  imageUrl: string | null | undefined;
}

export async function MemberEntry({
  groupId,
  currency,
  memberId,
  memberEmail,
  memberName,
  imageUrl,
}: IProps) {
  const { grossBalance, isInDebt } =
    await serverClient.group.getDebtsByMemberId({
      groupId,
      memberId,
    });

  const displayAmount = isInDebt ? -grossBalance : grossBalance;
  const CurrencyIcon = currencyIconMap[currency].icon;

  // TODO: Handle rendering when member is all settled up.
  return (
    <li className="flex items-center gap-x-4">
      <div className="flex h-14 w-14 items-center justify-center">
        <Avatar variant="lg" userName={memberName} userImageUrl={imageUrl} />
      </div>
      <div className="flex-1 font-medium">
        <h4 className="line-clamp-1 text-base">{memberName}</h4>
        <p className="line-clamp-1 text-sm text-neutral-400">{memberEmail}</p>
      </div>
      {grossBalance === 0 ? (
        <p className="text-sm font-medium italic text-neutral-400">
          all settled up
        </p>
      ) : (
        <div
          className={cn(
            "flex flex-col items-end justify-center",
            isInDebt ? "text-orange-600" : "text-cta",
          )}
        >
          <p className="text-xs font-medium md:text-sm">
            {isInDebt ? "owes" : "gets back"}
          </p>
          <div className="flex items-center font-semibold">
            <CurrencyIcon className="h-4 w-4" />
            <span>{(displayAmount / 100).toLocaleString()}</span>
          </div>
        </div>
      )}
    </li>
  );
}
