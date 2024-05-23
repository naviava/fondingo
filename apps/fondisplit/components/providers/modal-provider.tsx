"use client";

import { useEffect, useState } from "react";

import { AddFriendModal } from "../modals/add-friend-modal";
import { AddMemberModal } from "../modals/add-member-modal";
import { ConfirmModal } from "@fondingo/ui/confirm-modal";

export function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <>
      <AddMemberModal />
      <ConfirmModal />
      <AddFriendModal />
    </>
  );
}
