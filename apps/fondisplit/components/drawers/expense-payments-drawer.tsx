"use client";

import { useCallback, useState } from "react";

import { useExpenseDetails } from "@fondingo/store/fondisplit";
import { Check, ChevronRight } from "@fondingo/ui/lucide";
import { Separator } from "@fondingo/ui/separator";
import { Avatar } from "@fondingo/ui/avatar";
import { Button } from "@fondingo/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@fondingo/ui/drawer";

import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";

export function ExpensePaymentsDrawer() {
  const [isMultiple, setIsMultiple] = useState(false);

  const {
    isPaymentsDrawerOpen,
    onPaymentsDrawerClose,
    groupId,
    payments,
    setPayments,
    expenseAmount,
  } = useExpenseDetails();

  const { data: members } = trpc.group.getMembers.useQuery(groupId);

  const handleSinglePayer = useCallback(
    ({ userId, userName }: { userId: string; userName: string }) => {
      setPayments([
        {
          userId,
          userName,
          amount: expenseAmount,
        },
      ]);
    },
    [setPayments, expenseAmount],
  );

  return (
    <Drawer open={isPaymentsDrawerOpen} onOpenChange={onPaymentsDrawerClose}>
      <DrawerContent className="mx-auto max-w-xl">
        <DrawerHeader className="px-0 py-1">
          <DrawerTitle className="flex items-center justify-between px-4">
            <Button
              size="sm"
              variant="splitGhost"
              onClick={onPaymentsDrawerClose}
            >
              Cancel
            </Button>
            Choose payer
            <Button
              size="sm"
              variant="splitGhost"
              onClick={isMultiple ? () => {} : onPaymentsDrawerClose}
            >
              {isMultiple ? "Save" : "Done"}
            </Button>
          </DrawerTitle>
          <Separator />
        </DrawerHeader>
        <ul className="space-y-4 px-8 py-4">
          {members?.map((member) => (
            <li
              key={member.id}
              onClick={() =>
                handleSinglePayer({ userId: member.id, userName: member.name })
              }
              className="flex cursor-pointer items-center justify-between border-b pb-2"
            >
              <div className="flex items-center">
                <Avatar
                  userImageUrl={member.user?.image}
                  userName={member.name}
                />
                <p
                  className={cn(
                    "ml-4",
                    payments.length === 1 &&
                      payments[0]?.userName === member.name &&
                      "font-semibold",
                  )}
                >
                  {member.name}
                </p>
              </div>
              {payments.length === 1 &&
                payments[0]?.userName === member.name && (
                  <Check className="text-cta" />
                )}
            </li>
          ))}
          {!isMultiple && (
            <li
              onClick={() => setIsMultiple(true)}
              className="flex cursor-pointer items-center justify-between border-b pb-2"
            >
              Multiple people
              <ChevronRight className="text-muted-foreground" />
            </li>
          )}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}
