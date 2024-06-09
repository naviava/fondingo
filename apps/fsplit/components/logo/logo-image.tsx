import { cn } from "@fondingo/ui/utils";
import Image from "next/image";

interface IProps {
  className?: string;
}

export function LogoImage({ className }: IProps) {
  return (
    <div className={cn("relative aspect-square", className)}>
      <Image
        fill
        src="/images/logo.png"
        alt="FSplit Logo"
        className="object-cover"
      />
    </div>
  );
}
