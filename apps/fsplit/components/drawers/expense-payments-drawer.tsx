"use client";

import { useCallback, useMemo, useState } from "react";

import { ExpensePaymentsMember } from "./expense-payments-member";
import { useExpenseDetails } from "@fondingo/store/fondisplit";
import { ScrollArea } from "@fondingo/ui/scroll-area";
import { Separator } from "@fondingo/ui/separator";
import { Button } from "@fondingo/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@fondingo/ui/drawer";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
} from "@fondingo/ui/lucide";

import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";

export function ExpensePaymentsDrawer() {
  const {
    isPaymentsDrawerOpen,
    onPaymentsDrawerClose,
    groupId,
    expenseAmount,
    payments,
    setPayments,
    clearPayments,
  } = useExpenseDetails();

  const { data: members } = trpc.group.getMembers.useQuery(groupId);
  const [isMultiple, setIsMultiple] = useState(payments.length > 1);
  const [paymentsState, setPaymentsState] = useState<
    {
      userId: string;
      userName: string;
      amount: number;
    }[]
  >(payments);

  const sum = useMemo(() => {
    return paymentsState.reduce((total, payment) => {
      return total + Math.floor(payment.amount * 100) / 100;
    }, 0);
  }, [paymentsState]);

  const hasNegativeAmount = useMemo(
    () =>
      !!paymentsState.find((payment) => Math.floor(payment.amount * 100) < 0),
    [paymentsState],
  );

  const handleMultiplePayers = useCallback(() => {
    if (sum !== expenseAmount || hasNegativeAmount) {
      return;
    } else {
      setPayments(
        paymentsState.filter((payment) => Math.floor(payment.amount * 100) > 0),
      );
      onPaymentsDrawerClose();
    }
  }, [
    expenseAmount,
    sum,
    paymentsState,
    hasNegativeAmount,
    setPayments,
    onPaymentsDrawerClose,
  ]);

  return (
    <Drawer
      open={isPaymentsDrawerOpen}
      onOpenChange={() => {
        setPaymentsState([]);
        onPaymentsDrawerClose();
        if (paymentsState.length > 1) {
          return;
        } else {
          setIsMultiple(false);
        }
      }}
    >
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
              disabled={
                sum !== expenseAmount ||
                (!!paymentsState.length && hasNegativeAmount)
              }
              onClick={
                isMultiple ? handleMultiplePayers : onPaymentsDrawerClose
              }
              className="disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              {isMultiple ? "Save" : "Done"}
            </Button>
          </DrawerTitle>
          <Separator />
        </DrawerHeader>
        <div className="space-y-4 px-8 py-4">
          {isMultiple && (
            <div className="flex flex-col items-center justify-center text-sm">
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
          <ScrollArea
            className={cn(!!members && members.length > 5 && "h-[40vh]")}
          >
            <ul className="space-y-4">
              {members?.map((member) => (
                <ExpensePaymentsMember
                  key={member.id}
                  userId={member.id}
                  userName={member.name}
                  userImageUrl={member.user?.image}
                  isMultiple={isMultiple}
                  setPaymentsState={setPaymentsState}
                />
              ))}
              {isMultiple ? (
                <li
                  onClick={() => {
                    clearPayments();
                    setIsMultiple(false);
                  }}
                  className="flex cursor-pointer items-center justify-between border-b pb-2"
                >
                  <span className="text-muted-foreground text-sm font-medium">
                    Single payer
                  </span>
                  <ChevronLeft className="text-muted-foreground" />
                </li>
              ) : (
                <li
                  onClick={() => {
                    setIsMultiple(true);
                  }}
                  className="flex cursor-pointer items-center justify-between border-b pb-2"
                >
                  <span className="text-muted-foreground text-sm font-medium">
                    Multiple people
                  </span>
                  <ChevronRight className="text-muted-foreground" />
                </li>
              )}
            </ul>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
