import { useRouter } from "next/navigation";

import { toast } from "@fondingo/ui/use-toast";
import { useUtils } from "~/hooks/use-utils";
import { trpc } from "~/lib/trpc/client";

export function useRemoveMember() {
  const router = useRouter();
  const { invalidateAll } = useUtils();

  const removeMemberMutation = trpc.group.removeMemberFromGroup.useMutation({
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
      router.refresh();
    },
  });

  return { removeMemberMutation };
}
