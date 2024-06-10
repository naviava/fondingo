"use client";

import Image, { StaticImageData } from "next/image";

import { useIsMounted } from "~/hooks/use-is-mounted";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  image: StaticImageData;
  fill?: boolean;
  alt: string;
  className?: string;
}

export function BlurImageLoader({ image, fill, alt, className }: IProps) {
  const isMounted = useIsMounted();

  return (
    <Image
      fill={fill}
      src={image}
      alt={alt}
      className={cn(
        "object-cover blur-[20px] transition-all duration-700",
        className,
        isMounted && "blur-none",
      )}
    />
  );
}
