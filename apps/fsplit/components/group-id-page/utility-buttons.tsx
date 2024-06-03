import { ChevronLeft, Settings } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import Link from "next/link";

interface IProps {
  groupId: string;
  showTotals: boolean;
  showBalances: boolean;
  showActivity: boolean;
}

export function UtilityButtons({
  groupId,
  showTotals,
  showBalances,
  showActivity,
}: IProps) {
  return (
    <>
      <Button
        asChild
        variant="ctaGhost"
        className="absolute left-4 top-4 text-white"
      >
        <Link
          href={
            showBalances || showTotals || showActivity
              ? `/groups/${groupId}`
              : "/groups"
          }
        >
          <ChevronLeft />
        </Link>
      </Button>
      <Button
        asChild
        type="button"
        variant="ctaGhost"
        className="absolute right-4 top-4 text-white"
      >
        <Link href={`/groups/${groupId}/settings`}>
          <Settings />
        </Link>
      </Button>
    </>
  );
}
