"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";

import { useExpenseDetails } from "@fondingo/store/fondisplit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { Form, FormControl, FormField, FormItem } from "@fondingo/ui/form";
import { IndianRupee, LayoutList, X } from "@fondingo/ui/lucide";
import { Separator } from "@fondingo/ui/separator";
import { useToast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";

import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";
import { hexToRgb } from "~/lib/utils";

const formSchema = z.object({
  groupId: z.string().min(1, { message: "Group ID is required" }),
  expenseName: z.string().min(1, { message: "Expense name is required" }),
  expenseAmount: z
    .string()
    .min(1, { message: "Amount must be greater than 0" }),
  payments: z.array(
    z.object({
      userId: z.string().min(1),
      amount: z.number(),
    }),
  ),
  splits: z.array(
    z.object({
      userId: z.string().min(1),
      amount: z.number(),
    }),
  ),
});

interface IProps {
  params: { groupId: string };
}

export default function AddExpensePage({ params }: IProps) {
  const { toast } = useToast();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { data: group } = trpc.group.getGroupById.useQuery(params.groupId);

  const {
    groupId,
    setGroupId,
    expenseName,
    setExpenseName,
    expenseAmount,
    setExpenseAmount,
    payments,
    clearPayments,
    isPaymentsDrawerOpen,
    onPaymentsDrawerOpen,
    splits,
    splitType,
    clearSplits,
    isSplitsDrawerOpen,
    onSplitsDrawerOpen,
  } = useExpenseDetails();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: params.groupId,
      expenseName: "",
      expenseAmount: "",
      payments: [],
      splits: [],
    },
  });

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log(values);
  }, []);

  useEffect(() => {
    setExpenseName(form.getValues("expenseName"));
    setExpenseAmount(Number(form.getValues("expenseAmount")));
    setGroupId(params.groupId);
    form.setValue("payments", payments);
    form.setValue("splits", splits);
  }, [
    setGroupId,
    params.groupId,
    form,
    payments,
    splits,
    expenseName,
    expenseAmount,
    groupId,
    setExpenseName,
    setExpenseAmount,
    isPaymentsDrawerOpen,
  ]);

  return (
    <>
      <div className="flex items-center justify-between px-2 pt-4">
        <Button asChild variant="splitGhost">
          <Link href={`/groups/${params.groupId}`}>
            <X className="text-muted-foreground h-8 w-8" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Add an expense</h1>
        <Button
          type="button"
          variant="splitGhost"
          className="w-20"
          onClick={() => {
            submitButtonRef.current?.click();
          }}
        >
          Save
        </Button>
      </div>
      <div className="flex items-center px-6 pt-2 text-sm font-medium">
        <p>
          With <span className="font-bold">you</span> and:
        </p>
        <div
          className="ml-2 rounded-full border-2 px-2 py-1"
          style={{
            borderColor: group?.color,
            // @ts-ignore
            backgroundColor: hexToRgb(group?.color || "#000000", 0.1),
          }}
        >
          All of <span className="font-bold">{group?.name}</span>
        </div>
      </div>
      <Separator className="mb-6 mt-2" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto mt-16 w-[75%] space-y-8"
        >
          <div className="flex gap-x-4">
            <div className="rounded-md border-2 border-neutral-300 p-1 shadow-md shadow-neutral-500">
              <LayoutList size={36} />
            </div>
            <FormField
              control={form.control}
              name="expenseName"
              // @ts-ignore
              render={({ field }) => (
                <FormItem className="h-12 w-full">
                  <FormControl>
                    <Input
                      placeholder="Enter a description"
                      {...field}
                      value={expenseName}
                      onChange={(e) => {
                        form.setValue("expenseName", e.target.value);
                        setExpenseName(e.target.value);
                      }}
                      className={cn(
                        "form-input h-full placeholder:text-neutral-400",
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-center gap-x-4">
            <div className="rounded-md border-2 border-neutral-300 p-1 shadow-md shadow-neutral-500">
              <IndianRupee size={36} />
            </div>
            <FormField
              control={form.control}
              name="expenseAmount"
              // @ts-ignore
              render={({ field }) => (
                <FormItem className="h-12 w-full">
                  <FormControl>
                    <Input
                      placeholder="0.00"
                      type="number"
                      step={0.1}
                      {...field}
                      value={expenseAmount === 0 ? "" : expenseAmount}
                      onChange={(e) => {
                        form.setValue("expenseAmount", e.target.value);
                        clearPayments();
                        setExpenseAmount(Number(e.target.value));
                      }}
                      className={cn(
                        "form-input h-full placeholder:text-neutral-400",
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="mx-auto flex w-fit items-center justify-center rounded-lg border border-neutral-300 pl-2 text-sm shadow-sm shadow-neutral-500">
            <p>Paid by</p>
            <Button
              type="button"
              variant="splitGhost"
              size="sm"
              onClick={() => {
                if (Number(form.getValues("expenseAmount")) > 0) {
                  clearPayments();
                  onPaymentsDrawerOpen();
                } else
                  toast({
                    title: "Enter an amount",
                    description:
                      "Amount must be greater than 0 before selecting a payer",
                  });
              }}
            >
              {payments.length === 0
                ? "choose"
                : payments.length === 1
                  ? `${payments[0]?.userName}`
                  : `${payments.length} members`}
            </Button>
            <p>and split</p>
            <Button
              type="button"
              variant="splitGhost"
              size="sm"
              onClick={() => {
                if (Number(form.getValues("expenseAmount")) > 0) {
                  clearSplits();
                  onSplitsDrawerOpen();
                } else
                  toast({
                    title: "Enter an amount",
                    description:
                      "Amount must be greater than 0 before selecting a payer",
                  });
              }}
            >
              {splitType}
            </Button>
          </div>
          <button ref={submitButtonRef} type="submit" className="hidden" />
        </form>
      </Form>
    </>
  );
}
