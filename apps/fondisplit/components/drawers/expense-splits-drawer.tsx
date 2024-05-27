"use client";

import { useCallback, useMemo, useState } from "react";

import { CheckCircle, TriangleAlert } from "@fondingo/ui/lucide";
import { useExpenseDetails } from "@fondingo/store/fondisplit";
import { ExpenseSplitsMember } from "./expense-splits-member";
import { ScrollArea } from "@fondingo/ui/scroll-area";
import { Separator } from "@fondingo/ui/separator";
import { Button } from "@fondingo/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@fondingo/ui/drawer";

import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";

const textMap = {
  equally: {
    title: "Split equally",
    tagline: "Select which people owe an equal share.",
  },
  custom: {
    title: "Split by exact amounts",
    tagline: "Specify exactly how much each person owes.",
  },
};

export function ExpenseSplitsDrawer() {
  const {
    splits,
    groupId,
    splitType,
    expenseAmount,
    isSplitsDrawerOpen,
    setSplits,
    setSplitType,
    onSplitsDrawerClose,
  } = useExpenseDetails();

  const { data: members } = trpc.group.getMembers.useQuery(groupId);

  const [splitsState, setSplitsState] = useState<
    {
      userId: string;
      userName: string;
      amount: number;
    }[]
  >(splits);

  const sum = useMemo(
    () =>
      splitsState.reduce((total, payment) => {
        total += Math.floor(payment.amount * 100) / 100;
        return total;
      }, 0),
    [splitsState],
  );

  const hasNegativeAmount = useMemo(
    () => !!splitsState.find((split) => split.amount < 0),
    [splitsState],
  );

  const handleCustomSplit = useCallback(() => {
    if (splitType === "equally") {
      return onSplitsDrawerClose();
    }
    if (sum !== expenseAmount) {
      return;
    }
    setSplits(
      splitsState.filter((payment) => Math.floor(payment.amount * 100) > 0),
    );
    return onSplitsDrawerClose();
  }, [
    expenseAmount,
    onSplitsDrawerClose,
    setSplits,
    splitsState,
    sum,
    splitType,
  ]);

  return (
    <Drawer
      open={isSplitsDrawerOpen}
      onOpenChange={() => {
        setSplitsState([]);
        onSplitsDrawerClose();
        if (splitsState.length > 1) {
          return;
        }
      }}
    >
      <DrawerContent className="mx-auto max-w-xl">
        <DrawerHeader className="px-0 py-1">
          <DrawerTitle className="flex items-center justify-between px-4">
            <Button
              size="sm"
              variant="splitGhost"
              onClick={onSplitsDrawerClose}
            >
              Cancel
            </Button>
            Split options
            <Button
              size="sm"
              variant="splitGhost"
              disabled={splitType === "custom" && sum !== expenseAmount}
              onClick={handleCustomSplit}
              className="disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              Done
            </Button>
          </DrawerTitle>
          <Separator />
        </DrawerHeader>
        <div className="mt-2 text-center text-sm">
          <h4 className="font-bold">{textMap[splitType].title}</h4>
          <p className="font-medium">{textMap[splitType].tagline}</p>
        </div>
        <div className="mt-4 flex items-center justify-center gap-x-8">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setSplits([]);
              setSplitsState([]);
              setSplitType("equally");
            }}
            className={cn(
              "w-20 rounded-none text-6xl font-bold shadow-sm shadow-neutral-500",
              splitType === "equally" &&
                "bg-cta hover:bg-cta text-white hover:text-white",
            )}
          >
            =
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setSplits([]);
              setSplitsState([]);
              setSplitType("custom");
            }}
            className={cn(
              "w-20 rounded-none text-4xl font-bold shadow-sm shadow-neutral-500",
              splitType === "custom" &&
                "bg-cta hover:bg-cta text-white hover:text-white",
            )}
          >
            1.23
          </Button>
        </div>
        <ScrollArea
          className={cn(!!members && members.length > 5 && "h-[40vh]")}
        >
          <ul className="space-y-4 px-8 py-4">
            {members?.map((member) => (
              <ExpenseSplitsMember
                key={member.id}
                userId={member.id}
                userName={member.name}
                userImageUrl={member.user?.image}
                setSplitsState={setSplitsState}
              />
            ))}
          </ul>
        </ScrollArea>
        {splitType === "custom" && (
          <div className="mb-4 flex flex-col items-center justify-center text-sm">
            {hasNegativeAmount ? (
              <div className="flex items-center text-rose-500">
                <TriangleAlert className="mr-2 h-4 w-4" />
                <p>No amounts can be negative</p>
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  {sum === expenseAmount && (
                    <CheckCircle className="text-cta mr-2 h-4 w-4" />
                  )}
                  <p
                    className={cn(
                      "font-bold",
                      sum === expenseAmount && "text-cta",
                    )}
                  >{`${sum.toLocaleString()} of ${expenseAmount.toLocaleString()} assigned`}</p>
                </div>
                {expenseAmount - sum !== 0 && (
                  <p className="font-medium text-rose-500">{`${(expenseAmount - sum).toLocaleString()} left`}</p>
                )}
              </>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
