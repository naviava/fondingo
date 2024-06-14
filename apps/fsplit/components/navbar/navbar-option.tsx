"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { Avatar } from "@fondingo/ui/avatar";
import { IconType } from "react-icons";

import { useMediaQuery } from "@fondingo/utils/hooks";
import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";
import { AnimatePresence, motion } from "framer-motion";

interface IProps {
  href: string;
  label: string;
  // isActive: boolean;
  activeIcon: IconType;
  inactiveIcon: IconType;
  showNotification?: boolean;
}

// export const NavbarOption = memo(_NavbarOption);
export function NavbarOption({
  href,
  label,
  // isActive,
  showNotification,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
}: IProps) {
  const pathname = usePathname();
  const { isTab } = useMediaQuery();
  const { data } = trpc.user.getFriendRequests.useQuery();
  const { data: currentUser } = trpc.user.getAuthProfile.useQuery();
  const isActive = useMemo(() => pathname.startsWith(href), [pathname, href]);

  const incomingFriendRequestCount = useMemo(
    () => data?.receivedFriendRequests.length || 0,
    [data?.receivedFriendRequests.length],
  );

  return (
    <motion.div className="relative flex flex-col items-center gap-y-1">
      {isActive && (
        <motion.div
          layoutId="nav-item"
          className="bg-cta absolute -top-2 h-[2px] w-full"
        />
      )}
      {showNotification && !!incomingFriendRequestCount && (
        <div className="bg-cta absolute -top-1 right-0 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white">
          {incomingFriendRequestCount}
        </div>
      )}
      {label === "Account" ? (
        <Avatar
          variant={isTab ? "sm" : "xs"}
          userName={currentUser?.name}
          userImageUrl={currentUser?.image}
        />
      ) : (
        <>
          {isActive ? (
            <ActiveIcon className="text-cta h-5 w-5 md:h-6 md:w-6" />
          ) : (
            <InactiveIcon className="h-5 w-5 text-neutral-600 md:h-6 md:w-6" />
          )}
        </>
      )}
      <NavOptionLabel label={label} isActive={isActive} />
    </motion.div>
  );
}

function NavOptionLabel({
  label,
  isActive,
}: {
  label: string;
  isActive: boolean;
}) {
  return (
    <span
      className={cn(
        "text-xs font-medium text-neutral-600 transition-all md:text-base",
        isActive && "text-cta",
      )}
    >
      {label}
    </span>
  );
}
