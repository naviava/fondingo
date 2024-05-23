import { FcComboChart } from "react-icons/fc";
import { hexToRgb } from "~/lib/utils";

interface IProps {
  groupColor: string;
}

export function ExpenseAvatar({ groupColor }: IProps) {
  return (
    <div
      className="p-1"
      style={{
        border: `2px solid ${hexToRgb(groupColor, 0.3)}`,
      }}
    >
      <FcComboChart className="h-8 w-8 md:h-9 md:w-9" />
    </div>
  );
}
