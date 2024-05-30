"use client";

import { memo } from "react";

import { IconType } from "react-icons";
import { trpc } from "~/lib/trpc/client";

import { Avatar } from "@fondingo/ui/avatar";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  label: string;
  isActive: boolean;
  inactiveIcon: IconType;
  activeIcon: IconType;
}

export const NavbarOption = memo(_NavbarOption);
function _NavbarOption({
  label,
  isActive,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
}: IProps) {
  const { data: currentUser } = trpc.user.getAuthProfile.useQuery();

  if (label === "Account") {
    return (
      // TODO: Replace with user avatar
      <div className="flex flex-col items-center gap-y-1">
        <Avatar
          variant="sm"
          userName={currentUser?.name}
          userImageUrl={currentUser?.image}
        />
        <span
          className={cn(
            "text-sm font-medium text-neutral-600 md:text-base",
            isActive && "text-cta font-semibold",
          )}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-y-1">
      {isActive ? (
        <ActiveIcon className="text-cta h-6 w-6" />
      ) : (
        <InactiveIcon className="h-6 w-6 text-neutral-600" />
      )}
      <span
        className={cn(
          "text-sm font-medium text-neutral-600 md:text-base",
          isActive && "text-cta font-semibold",
        )}
      >
        {label}
      </span>
    </div>
  );
}