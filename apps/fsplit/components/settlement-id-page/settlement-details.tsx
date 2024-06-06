"use client";

import { formatDate } from "@fondingo/utils/date-fns";
import { CurrencyCode } from "@fondingo/db-split";
import { usePanel } from "@fondingo/ui/use-panel";

import { DisplayAmount } from "~/components/display-amount";
import { FcMoneyTransfer } from "react-icons/fc";

interface IProps {
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  debtorName: string;
  creditorName: string;
  currency: CurrencyCode;
  creatorName: string | null;
  lastUpdatedByName: string | null;
}

export function SettlementDetails({
  amount,
  currency,
  updatedAt,
  createdAt,
  debtorName,
  creditorName,
  creatorName = "",
  lastUpdatedByName = "",
}: IProps) {
  const { topDivRef } = usePanel();

  return (
    <div
      ref={topDivRef}
      className="mt-16 flex flex-col items-center justify-center gap-y-4"
    >
      <FcMoneyTransfer size={80} />
      <h2 className="text-xl font-medium">{`${creditorName} paid ${debtorName}`}</h2>
      <h1 className="flex items-center font-bold">
        <DisplayAmount variant="xl" amount={amount} currency={currency} />
      </h1>
      <div className="space-y-1 text-center text-sm font-medium text-neutral-400">
        <p>
          Added by {creatorName} on {formatDate(createdAt, "LLL d yyyy")}
        </p>
        <p>
          Last updated by {lastUpdatedByName} on{" "}
          {formatDate(updatedAt, "LLL d yyyy")}
        </p>
      </div>
    </div>
  );
}
