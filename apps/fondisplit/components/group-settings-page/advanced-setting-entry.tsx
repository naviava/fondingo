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

export async function AdvancedSettingEntry({
  groupId,
  currency,
  memberId,
  memberEmail,
  memberName,
  imageUrl,
}: IProps) {
  return (
    <li className="flex items-center gap-x-4">
      <div className="flex h-14 w-14 items-center justify-center">
        <Avatar variant="lg" userName={memberName} userImageUrl={imageUrl} />
      </div>
      <div className="flex-1 font-medium">
        <h4 className="line-clamp-1 text-base">{memberName}</h4>
        <p className="line-clamp-1 text-sm text-neutral-400">{memberEmail}</p>
      </div>
      <div className="flex flex-col items-end justify-center">
        <p className="text-xs font-medium md:text-sm">gets back</p>
        <div className="flex items-center font-semibold">amount</div>
      </div>
    </li>
  );
}
