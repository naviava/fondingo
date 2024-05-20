"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { GroupMemberClient } from "~/types";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { ChevronLeft, IndianRupee } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { Avatar } from "@fondingo/ui/avatar";
import { Input } from "@fondingo/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@fondingo/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@fondingo/ui/select";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId,
      fromId: "",
      toId: "",
      amount: "",
    },
  });

  const [selectedDebtor, setSelectedDebtor] = useState<
    GroupMemberClient | undefined
  >(debtors[0]);
  const [selectedCreditor, setSelectedCreditor] = useState<
    GroupMemberClient | undefined
  >(creditors[0]);

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log({ ...values, amount: Number(values.amount) });
  }, []);

  useEffect(() => {
    console.log(form.getValues("fromId"));
    console.log(form.getValues("toId"));
  }, [form]);

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
          <p>Debtor: {selectedDebtor?.name || "None"}</p>
          <p>Creditor: {selectedCreditor?.name || "None"}</p>
        </form>
      </Form>
    </>
  );
}
