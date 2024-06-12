import { useState } from "react";

import { onMutateError } from "~/utils/on-mutate-error";
import { toast } from "@fondingo/ui/use-toast";
import { trpc } from "~/lib/trpc/client";
import { useRouter } from "next/navigation";

export function useInvite(email: string) {
  const router = useRouter();
  const [showIcon, setShowIcon] = useState(false);

  const utils = trpc.useUtils();
  const sendInviteMutation = trpc.misc.sendInvitation.useMutation({
    onError: onMutateError,
    onSuccess: ({ toastTitle, toastDescription }) => {
      toast({
        title: toastTitle,
        description: toastDescription,
      });
      utils.misc.getInviteByEmail.invalidate();
      router.refresh();
      setShowIcon(true);
    },
  });

  const existingInviteQuery = trpc.misc.getInviteByEmail.useQuery(email);

  return { existingInviteQuery, sendInviteMutation, showIcon, setShowIcon };
}
