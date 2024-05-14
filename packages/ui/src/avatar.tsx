import {
  Avatar as AvatarRadix,
  AvatarFallback,
  AvatarImage,
} from "./shadcn/avatar";

interface IProps {
  userName: string | null | undefined;
  userImageUrl: string | null | undefined;
  variant?: "default" | "sm";
}

const variantMap = {
  default: "h-10 w-10",
  sm: "h-6 w-6",
};

const textSizeMap = {
  default: "text-base",
  sm: "text-sm",
};

export function Avatar({
  userName,
  userImageUrl,
  variant = "default",
}: IProps) {
  return (
    <AvatarRadix className={variantMap[variant]}>
      <AvatarImage src={userImageUrl || ""} />
      <AvatarFallback className={textSizeMap[variant]}>
        {!userName ? "😊" : userName[0]?.toUpperCase()}
      </AvatarFallback>
    </AvatarRadix>
  );
}
