"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useSettlementDrawer } from "@fondingo/store/fsplit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUtils } from "~/hooks/use-utils";
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
  settlementId: z.string().optional(),
});

interface IProps {
  groupId: string;
  currency: CurrencyCode;
  members: GroupMemberClient[];
}

export const SettlementForm = memo(_SettlementForm);
function _SettlementForm({ groupId, currency, members }: IProps) {
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
      settlementId: "",
    },
  });

  const utils = trpc.useUtils();
  const { invalidateAll } = useUtils();
  const { mutate: handleAddSettlement, isPending: isPendingAdd } =
    trpc.expense.addSettlement.useMutation({
      onError: ({ message }) =>
        toast({ title: "Something went wrong", description: message }),
      onSuccess: () => {
        utils.group.getGroupTotals.invalidate();
        invalidateAll();
        resetDrawer();
        form.reset();
        router.push(`/groups/${groupId}`);
        router.refresh();
      },
    });
  const { mutate: handleEditSettlement, isPending: isPendingEdit } =
    trpc.expense.updateSettlement.useMutation({
      onError: ({ message }) =>
        toast({ title: "Something went wrong", description: message }),
      onSuccess: () => {
        utils.group.getGroupTotals.invalidate();
        invalidateAll();
        resetDrawer();
        form.reset();
        router.push(`/groups/${groupId}/settlement/${settlementId}`);
        router.refresh();
      },
    });

  const amount = useMemo(
    () => Number(searchParams.get("amount")) / 100,
    [searchParams],
  );
  const settlementId = useMemo(
    () => searchParams.get("settlementId"),
    [searchParams],
  );
  const fromId = useMemo(() => searchParams.get("from"), [searchParams]);
  const toId = useMemo(() => searchParams.get("to"), [searchParams]);

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (!!values.settlementId)
        return handleEditSettlement({
          groupId,
          settlementId: values.settlementId,
          fromId: selectedDebtor?.id || "",
          toId: selectedCreditor?.id || "",
          amount: Math.floor(Number(values.amount) * 100) / 100,
        });
      handleAddSettlement({
        groupId,
        fromId: selectedDebtor?.id || "",
        toId: selectedCreditor?.id || "",
        amount: Math.floor(Number(values.amount) * 100) / 100,
      });
    },
    [
      groupId,
      selectedDebtor,
      selectedCreditor,
      handleAddSettlement,
      handleEditSettlement,
    ],
  );

  useEffect(() => {
    if (!!settlementId) form.setValue("settlementId", settlementId);
    if (!flag && !!fromId && !!toId) {
      const debtor = members.find((member) => member.id === fromId);
      const creditor = members.find((member) => member.id === toId);
      if (!!debtor && !!creditor) {
        setSelectedDebtor(debtor);
        setSelectedCreditor(creditor);
        form.setValue("amount", amount?.toFixed(2) || "");
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
    settlementId,
    selectedDebtor,
    selectedCreditor,
    setSelectedDebtor,
    setSelectedCreditor,
  ]);

  return (
    <>
      <div className="flex items-center justify-between px-2 pt-4">
        <Button
          size="sm"
          variant="ghost"
          disabled={isPendingAdd || isPendingEdit}
          onClick={() => router.back()}
        >
          <ChevronLeft />
        </Button>
        <h1 className="text-lg font-semibold">Record a payment</h1>
        <Button
          size="sm"
          variant="ctaGhost"
          disabled={isPendingAdd || isPendingEdit}
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
              flag={flag}
              groupId={groupId}
              members={members}
              setFlag={setFlag}
              drawerType="debtor"
              disabled={isPendingAdd || isPendingEdit}
              selectedMember={selectedDebtor}
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
              flag={flag}
              groupId={groupId}
              members={members}
              setFlag={setFlag}
              drawerType="creditor"
              disabled={isPendingAdd || isPendingEdit}
              selectedMember={selectedCreditor}
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
                      type="number"
                      min={0.01}
                      step={0.01}
                      placeholder="0.00"
                      autoComplete="off"
                      disabled={isPendingAdd || isPendingEdit}
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
            disabled={isPendingAdd || isPendingEdit}
            className="hidden"
          />
        </form>
      </Form>
    </>
  );
}
