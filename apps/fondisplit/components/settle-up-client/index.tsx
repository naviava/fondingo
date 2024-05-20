"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

import { useSettleUpDrawer } from "@fondingo/store/fondisplit";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroupMemberClient } from "~/types";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { ChevronLeft, IndianRupee } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { Avatar } from "@fondingo/ui/avatar";
import { Input } from "@fondingo/ui/input";
import { Form, FormControl, FormField, FormItem } from "@fondingo/ui/form";

const formSchema = z.object({
  groupId: z.string().min(1, { message: "Group ID is required" }),
  fromId: z.string().min(1, { message: "Debtor ID is required" }),
  toId: z.string().min(1, { message: "Creditor ID is required" }),
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
    selectedDebtor,
    selectedCreditor,
    onDrawerOpen,
    setSelectedDebtor,
    setSelectedCreditor,
  } = useSettleUpDrawer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId,
      fromId: "",
      toId: "",
      amount: "",
    },
  });

  useEffect(() => {
    if (!selectedDebtor && !!debtors[0]) {
      form.setValue("fromId", debtors[0].id);
      setSelectedDebtor(debtors[0]);
    }
    if (!selectedCreditor && !!creditors[0]) {
      form.setValue("toId", creditors[0].id);
      setSelectedCreditor(creditors[0]);
    }
  }, [
    debtors,
    creditors,
    form,
    selectedDebtor,
    selectedCreditor,
    setSelectedDebtor,
    setSelectedCreditor,
  ]);

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log({ ...values, amount: Number(values.amount) });
  }, []);

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
            <Avatar
              key={selectedDebtor?.id}
              variant="lg"
              userName={selectedDebtor?.name || ""}
              userImageUrl={selectedDebtor?.image}
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
            <Avatar
              variant="lg"
              userName={selectedCreditor?.name}
              userImageUrl={selectedCreditor?.image}
            />
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
