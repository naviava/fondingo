"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useConfirmModal } from "@fondingo/store/use-confirm-modal";
import { differenceInSeconds } from "@fondingo/utils/date-fns";
import { useUtils } from "~/hooks/use-utils";

import { AdvancedSettingEntry } from "./advanced-setting-entry";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "@fondingo/ui/use-toast";
import { FcCalculator } from "react-icons/fc";
import { GiExitDoor } from "react-icons/gi";

import { serverClient } from "~/lib/trpc/server-client";
import { trpc } from "~/lib/trpc/client";
import { useIsMounted } from "~/hooks/use-is-mounted";
import { Loader } from "@fondingo/ui/lucide";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";

interface IProps {
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
  userId: string | undefined;
}

export function AdvancedSettings({ userId, group }: IProps) {
  const router = useRouter();
  const { invalidateAll } = useUtils();
  const { onOpen, onClose } = useConfirmModal();
  const [currentTime, setCurrentTime] = useState(new Date());

  const timeRemaining = useMemo(() => {
    if (!group.lastCacluatedDebtsAt) return 0;
    const diff = differenceInSeconds(
      currentTime,
      new Date(group.lastCacluatedDebtsAt),
    );
    const returnValue = 300 - diff;
    return returnValue > 0 ? returnValue : 0;
  }, [currentTime, group.lastCacluatedDebtsAt]);

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

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const isMounted = useIsMounted();
  // TODO: Add loading state
  if (!isMounted)
    return (
      <div className="flex items-center justify-center p-10">
        <Loader className="animate-spin text-neutral-400" />
      </div>
    );

  return (
    <section className="space-y-6">
      <h3 className={cn("px-4 text-base font-semibold", hfont.className)}>
        Advanced
      </h3>
      <ul className="space-y-4">
        <AdvancedSettingEntry
          icon={FcCalculator}
          isCalc={isPendingCalc}
          timeRemaining={timeRemaining}
          title="Calculate debts"
          description="This is done automatically, but if you see something off, you can trigger it manually, once every 5 minutes."
          disabled={
            isPendingRemove ||
            isPendingDelete ||
            isPendingCalc ||
            timeRemaining > 0
          }
          action={() => handleCalculateDebts(group.id)}
        />
        <AdvancedSettingEntry
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
