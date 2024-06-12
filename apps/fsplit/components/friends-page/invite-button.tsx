"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { onMutateError } from "~/utils/on-mutate-error";
import { toast } from "@fondingo/ui/use-toast";
import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

import { Loader2 } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { IoIosMail } from "react-icons/io";

interface IProps {
  friendEmail: string;
}

export function InviteButton({ friendEmail }: IProps) {
  const router = useRouter();
  const [showIcon, setShowIcon] = useState(false);

  const utils = trpc.useUtils();
  const sendInviteMutation = trpc.misc.sendInvitation.useMutation({
    onError: onMutateError,
    onSuccess: async ({ toastTitle, toastDescription }) => {
      toast({
        title: toastTitle,
        description: toastDescription,
      });
      utils.misc.getInviteByEmail.invalidate();
      router.refresh();
      animate("#initial-text", { scale: 0 }, { duration: 0.2 });
      setShowIcon(true);
    },
  });

  const existingInviteQuery = trpc.misc.getInviteByEmail.useQuery(friendEmail);
  const [scope, animate] = useAnimate();
  const [sentInvite, setSentInvite] = useState(false);

  const handleClick = useCallback(async () => {
    if (showIcon || sentInvite) return;
    sendInviteMutation.mutate(friendEmail);
  }, [showIcon, sentInvite, sendInviteMutation, friendEmail]);

  const isDisabled = useMemo(
    () => !!existingInviteQuery.data,
    [existingInviteQuery.data],
  );

  const isLoading = useMemo(
    () =>
      showIcon ||
      sentInvite ||
      existingInviteQuery.isFetching ||
      sendInviteMutation.isPending ||
      isDisabled,
    [
      showIcon,
      sentInvite,
      existingInviteQuery.isFetching,
      sendInviteMutation.isPending,
      isDisabled,
    ],
  );

  useEffect(() => {
    async function handleAnimation() {
      if (showIcon) {
        await animate(
          "#icon",
          { x: 0, opacity: 1 },
          { duration: 0.5, ease: "easeIn" },
        );
        await animate(
          "#icon",
          { x: 200, opacity: 0 },
          { duration: 0.5, ease: "easeOut" },
        );
        setShowIcon(false);
        setSentInvite(true);
      }
    }
    handleAnimation();

    if (existingInviteQuery.data) {
      setSentInvite(true);
    }
  }, [animate, showIcon, existingInviteQuery.data, setShowIcon]);

  return (
    <Button
      ref={scope}
      type="button"
      variant="ctaGhost"
      size="sm"
      disabled={isLoading}
      onClick={handleClick}
      className={cn("text-sm md:text-base", hfont.className)}
    >
      <AnimatePresence mode="wait">
        {showIcon ? (
          <motion.div
            id="icon"
            initial={{
              x: -400,
              opacity: 0,
            }}
          >
            <IoIosMail className="h-6 w-6" />
          </motion.div>
        ) : sentInvite ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="text-xs italic text-neutral-500 md:text-sm"
          >
            Invite sent
          </motion.span>
        ) : (
          <div id="initial-text" className="flex items-center">
            {(existingInviteQuery.isFetching ||
              sendInviteMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-neutral-400" />
            )}
            {!existingInviteQuery.isFetching && <span>Invite</span>}
          </div>
        )}
      </AnimatePresence>
    </Button>
  );
}
