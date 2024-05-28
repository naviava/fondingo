"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { RiDeleteBin6Line } from "react-icons/ri";
import { FcCalculator } from "react-icons/fc";
import { GiExitDoor } from "react-icons/gi";

import { AdvancedSettingEntry } from "./advanced-setting-entry";
import { toast } from "@fondingo/ui/use-toast";

import { serverClient } from "~/lib/trpc/server-client";
import { trpc } from "~/lib/trpc/client";
import { useUtils } from "~/hooks/use-utils";
import { useConfirmModal } from "@fondingo/store/use-confirm-modal";
import { calculateDebts } from "~/server/actions/group";

interface IProps {
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
  userId: string | undefined;
}

export function AdvancedSettings({ userId, group }: IProps) {
  const router = useRouter();
  const { onOpen, onClose } = useConfirmModal();
  const { invalidateAll } = useUtils();

  const isManager = useMemo(() => {
    const currentMember = group.members.find((m) => m.userId === userId);
    return currentMember?.role === "MANAGER";
  }, [userId, group.members]);
  const hasBalances = useMemo(
    () =>
      group.simplifiedDebts.filter(
        (debt) => debt.from.userId === userId || debt.to.userId === userId,
      ).length > 0,
    [group.simplifiedDebts, userId],
  );

  const { mutate: handleCalculateDebts, isPending: isPendingCalc } =
    trpc.group.calculateGroupDebts.useMutation({
      onError: ({ message }) =>
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: message,
        }),
      onSuccess: ({ toastTitle, toastDescription }) => {
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        invalidateAll();
        router.refresh();
      },
    });

  const { mutate: handleRemoveMember, isPending: isPendingRemove } =
    trpc.group.removeMemberFromGroup.useMutation({
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
        invalidateAll();
        router.push("/groups");
        router.refresh();
      },
    });
  const { mutate: handleDeleteGroupById, isPending: isPendingDelete } =
    trpc.group.deleteGroupById.useMutation({
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
        invalidateAll();
        router.push("/groups");
        router.refresh();
      },
    });

  const handleLeaveGroup = useCallback(() => {
    const isLastMember = group.members.length === 1;
    if (isLastMember) {
      return onOpen({
        title: "Delete group?",
        description:
          "Are you sure you want to delete this group? This will delete all expenses, payments and members within the group. This action is irreversible.",
        confirmAction: () => handleDeleteGroupById(group.id),
        cancelAction: onClose,
      });
    }

    const currentMember = group.members.find((m) => m.userId === userId);
    const noOfManagers = group.members.filter(
      (m) => m.role === "MANAGER",
    ).length;
    if (isManager && noOfManagers === 1)
      return toast({
        title: "Can't leave group",
        description:
          "You are the only manager in this group. Assign someone else first.",
      });

    onOpen({
      title: "Leave group",
      description: "Are you sure you want to leave this group?",
      confirmAction: () =>
        handleRemoveMember({
          groupId: group.id,
          memberId: currentMember?.id ?? "",
        }),
      cancelAction: onClose,
    });
  }, [
    userId,
    group.id,
    isManager,
    group.members,
    onOpen,
    onClose,
    handleRemoveMember,
    handleDeleteGroupById,
  ]);

  const handleDeleteGroup = useCallback(() => {
    onOpen({
      title: "Delete group?",
      description:
        "Are you sure you want to delete this group? This will delete all expenses, payments and members within the group. This action is irreversible.",
      confirmAction: () => handleDeleteGroupById(group.id),
      cancelAction: onClose,
    });
  }, [group.id, onOpen, onClose, handleDeleteGroupById]);

  return (
    <section className="space-y-6">
      <h3 className="px-4 text-base font-semibold">Advanced</h3>
      <ul className="space-y-4">
        <AdvancedSettingEntry
          groupId={group.id}
          icon={FcCalculator}
          isCalc={isPendingCalc}
          title="Calculate debts"
          description="Automatically combines debts to reduce the total number of repayments between group members."
          disabled={isPendingRemove || isPendingDelete || isPendingCalc}
          action={() => handleCalculateDebts(group.id)}
        />
        <AdvancedSettingEntry
          groupId={group.id}
          title="Change currency"
          currency={group.currency}
          description="Change the currency used in this group."
          disabled={isPendingRemove || isPendingDelete || isPendingCalc}
          action={() =>
            router.push(
              `/groups/${group.id}/edit?groupName=${group.name}&color=${group.color.slice(1)}&type=${group.type}&currency=${group.currency}`,
            )
          }
        />
        <AdvancedSettingEntry
          groupId={group.id}
          icon={GiExitDoor}
          title="Leave group"
          description={
            hasBalances
              ? "You can't leave this group because you have outstanding debts with other group members."
              : ""
          }
          disabled={
            hasBalances || isPendingRemove || isPendingDelete || isPendingCalc
          }
          action={handleLeaveGroup}
        />
        <AdvancedSettingEntry
          groupId={group.id}
          icon={RiDeleteBin6Line}
          title="Delete group"
          description={
            isManager ? "" : "Only group managers can delete a group."
          }
          disabled={
            !isManager || isPendingRemove || isPendingDelete || isPendingCalc
          }
          action={handleDeleteGroup}
          smallIcon
        />
      </ul>
    </section>
  );
}
