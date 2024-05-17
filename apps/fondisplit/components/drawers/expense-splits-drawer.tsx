"use client";

import { useCallback, useEffect, useState } from "react";

import { useExpenseDetails } from "@fondingo/store/fondisplit";
import { Separator } from "@fondingo/ui/separator";
import { Button } from "@fondingo/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@fondingo/ui/drawer";

import { trpc } from "~/lib/trpc/client";
import { ExpenseSplitsMember } from "./expense-splits-member";

export function ExpenseSplitsDrawer() {
  const {
    isSplitsDrawerOpen,
    onSplitsDrawerClose,
    groupId,
    expenseAmount,
    splits,
    setSplits,
    clearSplits,
  } = useExpenseDetails();

  const { data: members } = trpc.group.getMembers.useQuery(groupId);

  const [sum, setSum] = useState(0);
  const [splitsState, setSplitsState] = useState<
    {
      userId: string;
      userName: string;
      amount: number;
    }[]
  >([]);

  const handleCustomSplit = useCallback(() => {
    if (sum !== expenseAmount) {
      return;
    } else {
      setSplits(splitsState.filter((payment) => payment.amount > 0));
      onSplitsDrawerClose();
    }
  }, [expenseAmount, onSplitsDrawerClose, setSplits, splitsState, sum]);

  useEffect(() => {
    setSum(
      splitsState.reduce((total, payment) => {
        total += payment.amount;
        return total;
      }, 0),
    );
  }, [setSum, splitsState]);

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
              disabled={sum !== expenseAmount}
              onClick={() => {}}
              className="disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              {"Done"}
            </Button>
          </DrawerTitle>
          <Separator />
        </DrawerHeader>
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
      </DrawerContent>
    </Drawer>
  );
}
