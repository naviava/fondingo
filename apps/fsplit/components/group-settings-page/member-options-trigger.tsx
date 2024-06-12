"use client";

import { useCallback, useEffect } from "react";

import { useSession } from "next-auth/react";
import { useAnimate } from "framer-motion";
import { useConfirmModal } from "@fondingo/store/use-confirm-modal";
import { useRemoveMember } from "~/hooks/api/group/use-remove-member";
import { trpc } from "~/lib/trpc/client";
import { useAnimation } from "~/hooks/use-animation";

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
  const { data: session } = useSession();
  const { onOpen, onClose } = useConfirmModal();
  const { scope, scaleAndShake } = useAnimation();

  const { removeMemberMutation } = useRemoveMember();
  const { data: isGroupManager } = trpc.group.isGroupManager.useQuery(groupId);

  useEffect(() => {
    if (session?.user?.email === email) scaleAndShake();
  }, [scaleAndShake, session?.user?.email, email]);

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
          return scaleAndShake();
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
