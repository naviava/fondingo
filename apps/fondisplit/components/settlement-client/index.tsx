"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useSettlementDrawer } from "@fondingo/store/fondisplit";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroupMemberClient } from "~/types";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { Form, FormControl, FormField, FormItem } from "@fondingo/ui/form";
import { SettlementMember } from "./settlement-member";
import { ChevronLeft } from "@fondingo/ui/lucide";
import { toast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";

import { currencyIconMap } from "@fondingo/ui/constants";
import { CurrencyCode } from "@fondingo/db-split";
import { trpc } from "~/lib/trpc/client";

const formSchema = z.object({
  amount: z.string().min(1, { message: "Amount must be greater than 0" }),
});

interface IProps {
  groupId: string;
  currency: CurrencyCode;
  members: GroupMemberClient[];
}

export const SettlementClient = memo(_SettlementClient);
function _SettlementClient({ groupId, currency, members }: IProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [flag, setFlag] = useState(false);

  const CurrencyIcon = useMemo(
    () => currencyIconMap[currency].icon,
    [currency],
  );

  const {
    selectedDebtor,
    selectedCreditor,
    setSelectedDebtor,
    setSelectedCreditor,
    resetDrawer,
  } = useSettlementDrawer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
    },
  });

  const utils = trpc.useUtils();
  const { mutate: handleAddSettlement, isPending } =
    trpc.group.addSettlement.useMutation({
      onError: ({ message }) =>
        toast({ title: "Something went wrong", description: message }),
      onSuccess: () => {
        utils.expense.getSettlements.invalidate();
        utils.expense.getExpenseById.invalidate();
        utils.expense.getExpenseIds.invalidate();
        utils.group.getGroupById.invalidate();
        utils.group.getGroups.invalidate();
        utils.group.getDebts.invalidate();
        router.push(`/groups/${groupId}`);
        router.refresh();
        resetDrawer();
        form.reset();
      },
    });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      handleAddSettlement({
        groupId,
        fromId: selectedDebtor?.id || "",
        toId: selectedCreditor?.id || "",
        amount: Number(values.amount),
      });
    },
    [groupId, selectedDebtor, selectedCreditor, handleAddSettlement],
  );

  const amount = useMemo(
    () => Number(searchParams.get("amount")) / 100,
    [searchParams],
  );
  const fromId = useMemo(() => searchParams.get("from"), [searchParams]);
  const toId = useMemo(() => searchParams.get("to"), [searchParams]);

  useEffect(() => {
    if (!flag && !!fromId && !!toId) {
      const debtor = members.find((member) => member.id === fromId);
      const creditor = members.find((member) => member.id === toId);
      if (debtor && creditor) {
        setSelectedDebtor(debtor);
        setSelectedCreditor(creditor);
        form.setValue("amount", amount?.toLocaleString() || "");
        setFlag(true);
      }
    }
    if (!selectedDebtor && !!members[0]) {
      setSelectedDebtor(members[0]);
    }
    if (!selectedCreditor && !!members[1]) {
      setSelectedCreditor(members[1]);
    }
  }, [
    flag,
    form,
    toId,
    fromId,
    amount,
    members,
    selectedDebtor,
    selectedCreditor,
    setSelectedDebtor,
    setSelectedCreditor,
  ]);

  return (
    <>
      <div className="flex items-center justify-between px-2 pt-4">
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => router.back()}
        >
          <ChevronLeft />
        </Button>
        <h1 className="text-lg font-semibold">Record a payment</h1>
        <Button
          variant="splitGhost"
          size="sm"
          disabled={isPending}
          onClick={() => {
            submitButtonRef.current?.click();
          }}
        >
          Save
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col items-center justify-center pb-24"
        >
          <div className="flex items-center">
            <SettlementMember
              groupId={groupId}
              drawerType="debtor"
              members={members}
              selectedMember={selectedDebtor}
              isPending={isPending}
            />
            <div className="-mt-9 flex items-center">
              <div className="h-1.5 w-12 bg-neutral-700" />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "12px solid transparent",
                  borderLeft: "16px solid #404040",
                  borderBottom: "12px solid transparent",
                }}
              />
            </div>
            <SettlementMember
              groupId={groupId}
              drawerType="creditor"
              members={members}
              selectedMember={selectedCreditor}
              isPending={isPending}
            />
          </div>
          <div className="mt-10 flex items-center gap-x-4">
            <div className="rounded-md border-2 border-neutral-300 p-1 shadow-md shadow-neutral-500">
              <CurrencyIcon size={36} />
            </div>
            <FormField
              control={form.control}
              name="amount"
              // @ts-ignore
              render={({ field }) => (
                <FormItem className="h-12 w-full">
                  <FormControl>
                    <Input
                      placeholder="0.00"
                      autoComplete="off"
                      type="number"
                      min={0.01}
                      step={0.01}
                      disabled={isPending}
                      {...field}
                      className="form-input h-full max-w-[10rem] text-4xl font-semibold placeholder:text-4xl placeholder:text-neutral-400"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <button
            ref={submitButtonRef}
            type="submit"
            disabled={isPending}
            className="hidden"
          />
        </form>
      </Form>
    </>
  );
}
