"use client";

import { useEffect, useRef } from "react";

import { usePanelHeight } from "@fondingo/store/use-panel-height";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

interface IProps {
  title: string;
  className?: string;
}

export function SimpleTitleTopRef({ title, className }: IProps) {
  const topDivRef = useRef<HTMLHeadingElement>(null);
  const { setTopRef } = usePanelHeight((state) => state);

  useEffect(() => {
    function updateTopDivPosition() {
      const topDiv = topDivRef.current?.getBoundingClientRect();
      setTopRef(topDiv?.bottom);
    }
    updateTopDivPosition();
    window.addEventListener("resize", updateTopDivPosition);
    return () => window.removeEventListener("resize", updateTopDivPosition);
  }, [setTopRef]);

  return (
    <h1
      ref={topDivRef}
      className={cn(
        "mb-4 pt-4 text-center text-xl font-semibold",
        hfont.className,
        className,
      )}
    >
      {title}
    </h1>
  );
}
