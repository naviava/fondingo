import { ChevronLeft, Settings } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import Link from "next/link";

interface IProps {
  groupId: string;
  showTotals: boolean;
  showBalances: boolean;
}

export function UtilityButtons({ groupId, showBalances, showTotals }: IProps) {
  return (
    <>
      <Button
        asChild
        variant="splitGhost"
        className="absolute left-4 top-4 text-white"
      >
        <Link
          href={showBalances || showTotals ? `/groups/${groupId}` : "/groups"}
        >
          <ChevronLeft />
        </Link>
      </Button>
      <Button
        type="button"
        variant="splitGhost"
        className="absolute right-4 top-4 text-white"
      >
        <Settings />
      </Button>
    </>
  );
}
