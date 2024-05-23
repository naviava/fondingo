"use client";

import { useRouter } from "next/navigation";

import { Pencil, Trash2 } from "@fondingo/ui/lucide";
import { toast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { trpc } from "~/lib/trpc/client";

interface IProps {
  groupId: string;
  expenseId: string;
}

export function ExpenseActions({ groupId, expenseId }: IProps) {
  const router = useRouter();

  const utils = trpc.useUtils();
  const { mutate: handleDeleteExpense, isPending } =
    trpc.expense.deleteExpenseById.useMutation({
      onError: ({ message }) =>
        toast({
          title: "Something went wrong",
          description: message,
        }),
      onSuccess: ({ toastTitle, toastDescription }) => {
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        utils.expense.getExpenseById.invalidate();
        utils.group.invalidate();
        utils.user.invalidate();
        router.push(`/groups/${groupId}`);
        router.refresh();
      },
    });

  return (
    <div className="flex items-center gap-x-1">
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() => handleDeleteExpense({ groupId, expenseId })}
      >
        <Trash2 />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() => {
          // TODO: Handle edit expense
        }}
      >
        <Pencil />
      </Button>
    </div>
  );
}
