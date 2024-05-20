"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

import { useSettlementDrawer } from "@fondingo/store/fondisplit";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroupMemberClient } from "~/types";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { Form, FormControl, FormField, FormItem } from "@fondingo/ui/form";
import { ChevronLeft, IndianRupee } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { Avatar } from "@fondingo/ui/avatar";
import { Input } from "@fondingo/ui/input";

const formSchema = z.object({
  amount: z.string().min(1, { message: "Amount must be greater than 0" }),
});

interface IProps {
  groupId: string;
  debtors: GroupMemberClient[];
  creditors: GroupMemberClient[];
}

export const SettleUpClient = memo(_SettleUpClient);
function _SettleUpClient({ groupId, debtors, creditors }: IProps) {
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const {
    onDrawerOpen,
    selectedDebtor,
    selectedCreditor,
    setSelectedDebtor,
    setSelectedCreditor,
  } = useSettlementDrawer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
    },
  });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      console.log({
        groupId,
        fromId: selectedDebtor?.id,
        toId: selectedCreditor?.id,
        amount: Number(values.amount),
      });
    },
    [groupId, selectedDebtor, selectedCreditor],
  );

  useEffect(() => {
    if (!selectedDebtor && !!debtors[0]) {
      setSelectedDebtor(debtors[0]);
    }
    if (!selectedCreditor && !!creditors[0]) {
      setSelectedCreditor(creditors[0]);
    }
  }, [
    debtors,
    creditors,
    selectedDebtor,
    selectedCreditor,
    setSelectedDebtor,
    setSelectedCreditor,
  ]);

  return (
    <>
      <div className="flex items-center justify-between px-2 pt-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/groups/${groupId}`}>
            <ChevronLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Record a payment</h1>
        <Button
          variant="splitGhost"
          size="sm"
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
            <div
              role="button"
              onClick={() => {
                onDrawerOpen({
                  groupId,
                  members: debtors,
                  drawerType: "debtor",
                });
              }}
              className="select-none"
            >
              <Avatar
                key={selectedDebtor?.id}
                variant="lg"
                userName={selectedDebtor?.name || ""}
                userImageUrl={selectedDebtor?.image}
              />
            </div>
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
            <div
              role="button"
              onClick={() => {
                onDrawerOpen({
                  groupId,
                  members: creditors,
                  drawerType: "creditor",
                });
              }}
              className="select-none"
            >
              <Avatar
                variant="lg"
                userName={selectedCreditor?.name}
                userImageUrl={selectedCreditor?.image}
              />
            </div>
          </div>
          {!!selectedDebtor && !!selectedCreditor && (
            <p className="mt-4 font-medium">{`${selectedDebtor?.name} paid ${selectedCreditor.name}`}</p>
          )}
          <div className="mt-10 flex items-center gap-x-4">
            <div className="rounded-md border-2 border-neutral-300 p-1 shadow-md shadow-neutral-500">
              <IndianRupee size={36} />
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
                      {...field}
                      className="form-input h-full max-w-[10rem] text-4xl font-semibold placeholder:text-4xl placeholder:text-neutral-400"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <button ref={submitButtonRef} type="submit" className="hidden" />
        </form>
      </Form>
    </>
  );
}
