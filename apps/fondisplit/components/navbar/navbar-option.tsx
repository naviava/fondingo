"use client";

import { memo } from "react";
import { IconType } from "react-icons";

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
  if (label === "Account") {
    return (
      // TODO: Replace with user avatar
      <div className="flex flex-col items-center gap-y-1">
        {isActive ? (
          <ActiveIcon className="h-6 w-6" />
        ) : (
          <InactiveIcon className="h-6 w-6" />
        )}
        <span className="text-sm md:text-base">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-y-1">
      {isActive ? (
        <ActiveIcon className="h-6 w-6" />
      ) : (
        <InactiveIcon className="h-6 w-6" />
      )}
      <span className="text-sm md:text-base">{label}</span>
    </div>
  );
}
