"use client";

import { useRouter } from "next/navigation";
import { trpc } from "~/lib/trpc/client";

import { useConfirmModal } from "@fondingo/store/use-confirm-modal";
import { Pencil, Trash2 } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";

interface IProps {
  groupId: string;
  settlementId: string;
}

export function SettlementActions({ groupId, settlementId }: IProps) {
  const router = useRouter();
  const { onOpen, onClose } = useConfirmModal();

  const utils = trpc.useUtils();

  return (
    <div className="flex items-center gap-x-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={() =>
          onOpen({
            title: "Delete payment?",
            description:
              "Are you sure you want to delete this payment? This will remove the payment for ALL people involved, not just you. This action cannot be undone.",
            confirmAction: () => {},
            cancelAction: onClose,
          })
        }
      >
        <Trash2 />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          // TODO: Handle edit settlement
        }}
      >
        <Pencil />
      </Button>
    </div>
  );
}
