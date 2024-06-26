"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useExpenseDetails } from "@fondingo/store/fsplit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@fondingo/ui/use-toast";
import { useUtils } from "~/hooks/use-utils";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { currencyIconMap } from "@fondingo/ui/constants";
import { LayoutList, X } from "@fondingo/ui/lucide";
import { Separator } from "@fondingo/ui/separator";
import { Button } from "@fondingo/ui/button";
import { Loader } from "@fondingo/ui/lucide";
import { Input } from "@fondingo/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@fondingo/ui/form";

import { serverClient } from "~/lib/trpc/server-client";
import { hexToRgb, hfont } from "~/utils";
import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";

const formSchema = z.object({
  groupId: z.string().min(1, { message: "Group ID is required" }),
  expenseName: z
    .string()
    .min(1, { message: "Expense name is required" })
    .max(50, { message: "Expense name must be less than 50 characters" }),
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
  groupId: string;
  expenseId?: string;
  isEditing?: boolean;
  expense?: Awaited<ReturnType<typeof serverClient.expense.getExpenseById>>;
}

export default function ExpenseForm({
  isEditing = false,
  expenseId,
  groupId,
  expense,
}: IProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { data: group } = trpc.group.getGroupById.useQuery(groupId);

  const {
    currency,
    setCurrency,
    expenseName,
    setExpenseName,
    expenseAmount,
    setExpenseAmount,
    payments,
    setPayments,
    clearPayments,
    onPaymentsDrawerOpen,
    splits,
    splitType,
    setSplits,
    clearSplits,
    onSplitsDrawerOpen,
    clearExpenseDetails,
  } = useExpenseDetails((state) => state);

  const CurrencyIcon = useMemo(
    () => currencyIconMap[currency].icon,
    [currency],
  );

  const defaultPayments = useMemo(() => {
    if (!!expenseId && !!expense)
      return expense.payments.map((payment) => ({
        userId: payment.groupMemberId,
        userName: payment.groupMember.name,
        amount: payment.amount / 100,
      }));
    return [];
  }, [expenseId, expense]);

  const defaultSplits = useMemo(() => {
    if (!!expenseId && !!expense)
      return expense.splits.map((split) => ({
        userId: split.groupMemberId,
        userName: split.groupMember.name,
        amount: split.amount / 100,
      }));
    return [];
  }, [expenseId, expense]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId,
      expenseName: expense?.name || "",
      expenseAmount:
        (expense?.amount && (expense?.amount / 100).toFixed(2)) || "",
      payments: defaultPayments,
      splits: defaultSplits,
    },
  });

  useEffect(() => {
    setPayments(defaultPayments);
    setSplits(defaultSplits);
  }, [defaultPayments, defaultSplits, setPayments, setSplits]);

  useEffect(() => {
    setExpenseName(form.getValues("expenseName"));
    setExpenseAmount(
      Math.floor(Number(form.getValues("expenseAmount")) * 100) / 100,
    );
    setCurrency(group?.currency || "USD");
    form.setValue("payments", payments);
    form.setValue("splits", splits);
  }, [
    form,
    splits,
    groupId,
    payments,
    group?.currency,
    setCurrency,
    setExpenseAmount,
    setExpenseName,
  ]);

  const utils = trpc.useUtils();
  const { invalidateAll } = useUtils();
  const { mutate: handleAddExpense, isPending: isPendingAdd } =
    trpc.expense.addExpense.useMutation({
      onError: ({ message }) =>
        toast({ title: "Something went wrong", description: message }),
      onSuccess: ({ toastTitle, toastDescription }) => {
        setIsNavigating(true);
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        utils.group.getGroupTotals.invalidate();
        clearExpenseDetails();
        invalidateAll();
        form.reset();
        router.push(`/groups/${groupId}`);
        router.refresh();
      },
    });
  const { mutate: handleEditExpense, isPending: isPendingEdit } =
    trpc.expense.updateExpense.useMutation({
      onError: ({ message }) =>
        toast({ title: "Something went wrong", description: message }),
      onSuccess: ({ toastTitle, toastDescription }) => {
        setIsNavigating(true);
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        utils.group.getGroupTotals.invalidate();
        clearExpenseDetails();
        invalidateAll();
        form.reset();
        router.push(`/groups/${groupId}`);
        router.refresh();
      },
    });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (isEditing) {
        handleEditExpense({
          ...values,
          expenseId: expenseId ?? "",
          expenseAmount: Math.floor(Number(values.expenseAmount) * 100),
        });
      } else
        handleAddExpense({
          ...values,
          expenseAmount: Math.floor(Number(values.expenseAmount) * 100),
        });
    },
    [handleAddExpense, handleEditExpense, expenseId, isEditing],
  );

  const isLoading = useMemo(
    () => isPendingAdd || isPendingEdit || isNavigating,
    [isPendingAdd, isPendingEdit, isNavigating],
  );

  return (
    <>
      <div className="flex items-center justify-between px-2 pt-4">
        <Button asChild variant="ctaGhost" disabled={isLoading}>
          <Link
            href={
              isEditing
                ? `/groups/${groupId}/expense/${expenseId}`
                : `/groups/${groupId}`
            }
          >
            <X className="text-muted-foreground h-8 w-8" />
          </Link>
        </Button>
        <h1 className={cn("font-semibold md:text-lg", hfont.className)}>
          {isEditing ? "Edit expense" : "Add an expense"}
        </h1>
        <Button
          type="button"
          variant="ctaGhost"
          disabled={isLoading}
          onClick={() => {
            submitButtonRef.current?.click();
          }}
          className="w-20"
        >
          {isLoading ? <Loader className="h-6 w-6 animate-spin" /> : "Save"}
        </Button>
      </div>
      <div className="line-clamp-1 flex items-center px-6 pt-2 text-sm font-medium ">
        <p>
          With <span className="font-bold">you</span> and:
        </p>
        <div
          className="ml-2 line-clamp-1 max-w-[10rem] rounded-full border-2 px-2 py-1"
          style={{
            borderColor: group?.color,
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
                      autoComplete="off"
                      disabled={isLoading}
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-center gap-x-4">
            <div className="rounded-md border-2 border-neutral-300 p-1 shadow-md shadow-neutral-500">
              <CurrencyIcon size={36} />
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
                      autoComplete="off"
                      type="number"
                      step={0.1}
                      disabled={isLoading}
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
              variant="ctaGhost"
              size="sm"
              disabled={isLoading}
              onClick={() => {
                if (Number(form.getValues("expenseAmount")) > 0) {
                  onPaymentsDrawerOpen(groupId);
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
              variant="ctaGhost"
              size="sm"
              disabled={isLoading}
              onClick={() => {
                if (Number(form.getValues("expenseAmount")) > 0) {
                  clearSplits();
                  onSplitsDrawerOpen(groupId);
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
