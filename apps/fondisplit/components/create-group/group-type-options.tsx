import { cn } from "@fondingo/ui/utils";
import { IconType } from "react-icons";
import { TGroupType } from "~/types";

interface IProps {
  label: string;
  value: TGroupType;
  customClasses?: string;
  isSelected: boolean;
  icon: IconType;
  onClick: (value: TGroupType) => void;
}

export function GroupTypeOptions({
  label,
  value,
  customClasses,
  isSelected,
  icon: Icon,
  onClick,
}: IProps) {
  return (
    <div
      role="button"
      onClick={() => onClick(value)}
      className={cn(
        "flex w-fit items-center rounded-full border border-neutral-300 px-4 py-2 text-neutral-600",
        isSelected && "text-cta border-cta/50 bg-cta/10",
      )}
    >
      <Icon size={25} className={cn("mr-2", customClasses)} />
      <span className="select-none font-semibold tracking-wide">{label}</span>
    </div>
  );
}
