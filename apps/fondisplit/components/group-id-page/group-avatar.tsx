import { IoAirplaneOutline, IoHomeOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { FaRegListAlt } from "react-icons/fa";
import { hexToRgb } from "~/lib/utils";
import { TGroupType } from "~/types";

interface IProps {
  groupType: TGroupType;
  groupColor: string;
}

const iconMap = {
  TRIP: IoAirplaneOutline,
  HOME: IoHomeOutline,
  COUPLE: IoMdHeartEmpty,
  OTHER: FaRegListAlt,
};

export function GroupAvatar({ groupType, groupColor }: IProps) {
  const Icon = iconMap[groupType];

  return (
    <div
      className="absolute -bottom-8 left-20 flex aspect-square h-20 items-center justify-center rounded-2xl border-[6px] border-[#F4F4F4]"
      style={{
        backgroundImage: `linear-gradient(to bottom left, ${groupColor}, ${hexToRgb(groupColor, "0.5")})`,
      }}
    >
      <Icon size={48} className="text-white" />
    </div>
  );
}
