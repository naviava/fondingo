"use client";

import { useCallback, useEffect } from "react";

import { useSession } from "next-auth/react";
import { useAnimate } from "framer-motion";
import { useConfirmModal } from "@fondingo/store/use-confirm-modal";
import { useRemoveMember } from "~/hooks/api/group/use-remove-member";
import { trpc } from "~/lib/trpc/client";

interface IProps {
  children: React.ReactNode;
  id: string;
  name: string;
  email: string;
  groupId: string;
}

export function MemberOptionsTrigger({
  children,
  id,
  name,
  email,
  groupId,
}: IProps) {
  const [scope, animate] = useAnimate();
  const { data: session } = useSession();

  const { onOpen, onClose } = useConfirmModal();
  const { removeMemberMutation } = useRemoveMember();
  const { data: isGroupManager } = trpc.group.isGroupManager.useQuery(groupId);

  const handleAnimate = useCallback(async () => {
    if (!!scope.current) {
      await animate(scope.current, { scale: 1.1 }, { duration: 0.2 });
      for (let i = 0; i < 3; i++) {
        await animate(scope.current, { rotate: "5deg" }, { duration: 0.05 });
        await animate(scope.current, { rotate: "-5deg" }, { duration: 0.05 });
      }
      await animate(scope.current, { scale: 1, rotate: 0 });
    }
  }, [scope, animate]);

  useEffect(() => {
    if (session?.user?.email === email) handleAnimate();
  }, [handleAnimate, session?.user?.email, email]);

  return (
    <li
      ref={scope}
      role="button"
      onClick={() => {
        if (
          session?.user?.email === email ||
          !isGroupManager ||
          removeMemberMutation.isPending
        )
          return handleAnimate();
        onOpen({
          title: `Remove ${name} from the group?`,
          description: `This action is irreversible. Are you sure you want to remove ${name} from the group?`,
          confirmAction: () =>
            removeMemberMutation.mutate({ groupId, memberId: id }),
          cancelAction: onClose,
        });
      }}
      className="flex items-center gap-x-4 px-4 py-1 hover:bg-neutral-200"
    >
      {children}
    </li>
  );
}
