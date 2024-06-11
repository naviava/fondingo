import { TCurrencyCode } from "@fondingo/db-split";
import { toast } from "@fondingo/ui/use-toast";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { trpc } from "~/lib/trpc/client";
import { TGroupType } from "~/types";

interface IProps {
  form: any;
  initialData?: {
    groupId: string;
    groupName: string;
    color: string;
    type: TGroupType;
    currency: TCurrencyCode;
  };
}

export function useGroupMutate({ form, initialData }: IProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isNavigating, setIsNavigating] = useState(false);

  const createGroupMutation = trpc.group.createGroup.useMutation({
    onError: ({ message }) =>
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: message,
      }),
    onSuccess: ({ groupId, toastTitle, toastDescription }) => {
      setIsNavigating(true);
      toast({
        title: toastTitle,
        description: toastDescription,
      });
      form.reset();
      utils.group.getGroupById.invalidate();
      utils.group.getGroups.invalidate();
      router.push(`/groups/${groupId}`);
      router.refresh();
    },
  });
  const editGroupMutation = trpc.group.editGroup.useMutation({
    onError: ({ message }) =>
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: message,
      }),
    onSuccess: ({ groupId, toastTitle, toastDescription }) => {
      setIsNavigating(true);
      toast({
        title: toastTitle,
        description: toastDescription,
      });
      form.reset({
        groupName: initialData?.groupName,
        color: initialData?.color,
        type: initialData?.type,
        currency: initialData?.currency,
      });
      utils.group.getGroupById.invalidate();
      utils.group.getGroups.invalidate();
      router.push(`/groups/${groupId}/settings`);
      router.refresh();
    },
  });

  const isLoading = useMemo(
    () =>
      createGroupMutation.isPending ||
      editGroupMutation.isPending ||
      isNavigating,
    [createGroupMutation.isPending, editGroupMutation.isPending, isNavigating],
  );

  return {
    isLoading,
    editGroupMutation,
    createGroupMutation,
  };
}
