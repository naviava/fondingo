"use client";

import { memo, useMemo } from "react";

import { IconType } from "react-icons";
import { trpc } from "~/lib/trpc/client";

import { Avatar } from "@fondingo/ui/avatar";
import { cn } from "@fondingo/ui/utils";
import { useMediaQuery } from "@fondingo/utils/hooks";

interface IProps {
  label: string;
  isActive: boolean;
  activeIcon: IconType;
  inactiveIcon: IconType;
  showNotification?: boolean;
}

export const NavbarOption = memo(_NavbarOption);
function _NavbarOption({
  label,
  isActive,
  showNotification,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
}: IProps) {
  const { isTab } = useMediaQuery();
  const { data: currentUser } = trpc.user.getAuthProfile.useQuery();
  const { data } = trpc.user.getFriendRequests.useQuery();

  const incomingFriendRequestCount = useMemo(
    () => data?.receivedFriendRequests.length || 0,
    [data?.receivedFriendRequests.length],
  );

  if (label === "Account") {
    return (
      <div className="flex flex-col items-center gap-y-1">
        <Avatar
          variant={isTab ? "sm" : "xs"}
          userName={currentUser?.name}
          userImageUrl={currentUser?.image}
        />
        <span
          className={cn(
            "text-xs font-medium text-neutral-600 md:text-base",
            isActive && "text-cta",
          )}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-y-1">
      {showNotification && !!incomingFriendRequestCount && (
        <div className="bg-cta absolute -top-1 right-0 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white">
          {incomingFriendRequestCount}
        </div>
      )}
      {isActive ? (
        <ActiveIcon className="text-cta h-5 w-5 md:h-6 md:w-6" />
      ) : (
        <InactiveIcon className="h-5 w-5 text-neutral-600 md:h-6 md:w-6" />
      )}
      <span
        className={cn(
          "text-xs font-medium text-neutral-600 md:text-base",
          isActive && "text-cta",
        )}
      >
        {label}
      </span>
    </div>
  );
}
