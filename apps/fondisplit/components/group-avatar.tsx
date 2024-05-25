import { IoAirplaneOutline, IoHomeOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { FaRegListAlt } from "react-icons/fa";
import { TGroupType } from "~/types";

import { linearGradientWithAlpha } from "~/lib/utils";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  groupType: TGroupType;
  groupColor: string;
  className?: string;
  variant?: "default" | "md" | "sm";
}

const iconMap = {
  TRIP: IoAirplaneOutline,
  HOME: IoHomeOutline,
  COUPLE: IoMdHeartEmpty,
  OTHER: FaRegListAlt,
};

const variantMap = {
  default: {
    size: 48,
    classes: "h-20",
  },
  md: {
    size: 40,
    classes: "h-16",
  },
  sm: {
    size: 32,
    classes: "h-14",
  },
};

export function GroupAvatar({
  groupType,
  groupColor,
  variant = "default",
  className,
}: IProps) {
  const Icon = iconMap[groupType];

  return (
    <div
      className={cn(
        "flex aspect-square items-center justify-center rounded-2xl border-[6px] border-[#F4F4F4]",
        variantMap[variant].classes,
        className,
      )}
      style={{
        backgroundImage: linearGradientWithAlpha(groupColor, 0.5),
      }}
    >
      <Icon
        size={variantMap[variant].size}
        className={cn("text-white", groupType === "TRIP" && "-rotate-[45deg]")}
      />
    </div>
  );
}
