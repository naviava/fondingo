"use client";

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useSettlementDrawer } from "@fondingo/store/fondisplit";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroupMemberClient } from "~/types";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { Form, FormControl, FormField, FormItem } from "@fondingo/ui/form";
import { ChevronLeft, IndianRupee } from "@fondingo/ui/lucide";
import { SettlementMember } from "./settlement-member";
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
  const submitButtonRef = useRef<HTMLButtonElement>(null);
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
        form.reset();
        resetDrawer();
        utils.expense.getSettlements.invalidate();
        utils.group.getGroupById.invalidate();
        utils.group.getGroups.invalidate();
        utils.group.getDebts.invalidate();
        router.push(`/groups/${groupId}`);
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

  useEffect(() => {
    if (!selectedDebtor && !!members[0]) {
      setSelectedDebtor(members[0]);
    }
    if (!selectedCreditor && !!members[1]) {
      setSelectedCreditor(members[1]);
    }
  }, [
    members,
    selectedDebtor,
    selectedCreditor,
    setSelectedDebtor,
    setSelectedCreditor,
  ]);

  return (
    <>
      <div className="flex items-center justify-between px-2 pt-4">
        <Button asChild variant="ghost" size="sm" disabled={isPending}>
          <Link href={`/groups/${groupId}`}>
            <ChevronLeft />
          </Link>
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
          <div className="flex items-center gap-x-4">
            <SettlementMember
              groupId={groupId}
              drawerType="debtor"
              members={members}
              selectedMember={selectedDebtor}
              isPending={isPending}
            />
            <div className="flex items-center">
              <div className="h-1.5 w-7 bg-neutral-700" />
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
          {!!selectedDebtor && !!selectedCreditor && (
            <p className="mt-4 font-medium">{`${selectedDebtor?.name} paid ${selectedCreditor.name}`}</p>
          )}
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
