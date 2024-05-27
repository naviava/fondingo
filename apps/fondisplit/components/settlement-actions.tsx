"use client";

import { useRouter } from "next/navigation";

import { serverClient } from "~/lib/trpc/server-client";
import { useUtils } from "~/hooks/use-utils";
import { trpc } from "~/lib/trpc/client";

import { useConfirmModal } from "@fondingo/store/use-confirm-modal";
import { Pencil, Trash2 } from "@fondingo/ui/lucide";
import { toast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";

interface IProps {
  groupId: string;
  settlement: Awaited<
    ReturnType<typeof serverClient.expense.getSettlementById>
  >;
}

export function SettlementActions({ groupId, settlement }: IProps) {
  const router = useRouter();
  const { invalidateAll } = useUtils();
  const { onOpen, onClose } = useConfirmModal();

  const utils = trpc.useUtils();
  const { mutate: handleUpdateSettlement, isPending: isPendingUpdate } =
    trpc.expense.updateSettlement.useMutation({
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
        utils.group.getGroupTotals.invalidate();
        invalidateAll();
        onClose();
        router.push(`/groups/${groupId}`);
        router.refresh();
      },
    });

  const { mutate: handleDeleteSettlement, isPending: isPendingDelete } =
    trpc.expense.deleteSettlementById.useMutation({
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
        utils.group.getGroupTotals.invalidate();
        invalidateAll();
        onClose();
        router.push(`/groups/${groupId}`);
        router.refresh();
      },
    });

  return (
    <div className="flex items-center gap-x-1">
      <Button
        size="sm"
        variant="ghost"
        disabled={isPendingDelete || isPendingUpdate}
        onClick={() =>
          onOpen({
            title: "Delete payment?",
            description:
              "Are you sure you want to delete this payment? This will remove the payment for ALL people involved, not just you. This action cannot be undone.",
            confirmAction: () =>
              handleDeleteSettlement({ groupId, settlementId: settlement.id }),
            cancelAction: onClose,
          })
        }
      >
        <Trash2 />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPendingDelete || isPendingUpdate}
        onClick={() =>
          router.push(
            `/groups/${groupId}/settlement?settlementId=${settlement.id}&from=${settlement.fromId}&to=${settlement.toId}&amount=${settlement.amount}`,
          )
        }
      >
        <Pencil />
      </Button>
    </div>
  );
}
