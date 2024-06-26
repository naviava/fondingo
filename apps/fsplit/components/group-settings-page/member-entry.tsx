import { TCurrencyCode, TGroupRole } from "@fondingo/db-split";
import { serverClient } from "~/lib/trpc/server-client";
import { cn } from "@fondingo/ui/utils";

import { MemberOptionsTrigger } from "./member-options-trigger";
import { DisplayAmount } from "~/components/display-amount";
import { MdAdminPanelSettings } from "react-icons/md";
import { Avatar } from "@fondingo/ui/avatar";

interface IProps {
  groupId: string;
  memberId: string;
  memberName: string;
  memberRole: TGroupRole;
  memberEmail: string;
  currency: TCurrencyCode;
  imageUrl: string | null | undefined;
}

export async function MemberEntry({
  groupId,
  currency,
  memberId,
  memberEmail,
  memberRole,
  memberName,
  imageUrl,
}: IProps) {
  const { grossBalance, isInDebt } =
    await serverClient.group.getDebtsByMemberId({
      groupId,
      memberId,
    });

  return (
    <MemberOptionsTrigger
      id={memberId}
      name={memberName}
      email={memberEmail}
      groupId={groupId}
    >
      <div className="flex h-14 w-14 items-center justify-center">
        <Avatar variant="lg" userName={memberName} userImageUrl={imageUrl} />
      </div>
      <div className="flex-1 font-medium">
        <div className="flex items-center">
          <h4 className="line-clamp-1 text-base">{memberName}</h4>
          {memberRole === "MANAGER" && (
            <MdAdminPanelSettings className="text-cta ml-2 h-5 w-5" />
          )}
        </div>
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
          <DisplayAmount
            amount={grossBalance}
            currency={currency}
            className="font-semibold"
          />
        </div>
      )}
    </MemberOptionsTrigger>
  );
}
