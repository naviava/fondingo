import { cn } from "./lib/utils";
import {
  Tooltip as TooltipRadix,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./shadcn/tooltip";

interface IProps {
  children: React.ReactNode;
  tooltipText: string;
  className?: string;
  sideOffset?: number;
  delayDuration?: number;
  skipDelayDuration?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({
  children,
  tooltipText,
  className,
  side = "top",
  align = "center",
  sideOffset = 0,
  alignOffset = 0,
  delayDuration = 700,
  skipDelayDuration = 300,
}: IProps) {
  return (
    <TooltipProvider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      <TooltipRadix>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn(className)}
        >
          <p>{tooltipText}</p>
        </TooltipContent>
      </TooltipRadix>
    </TooltipProvider>
  );
}
