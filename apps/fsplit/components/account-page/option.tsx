"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";

import { ChevronRight } from "@fondingo/ui/lucide";
import { Separator } from "@fondingo/ui/separator";

interface IProps {
  label: string;
  onClick?: () => void;
}

const _Option = React.forwardRef<HTMLDivElement, IProps>(
  ({ label, onClick }, ref) => {
    return (
      <div ref={ref}>
        <div role="button" onClick={onClick} className="hover:bg-neutral-200">
          <div className="flex items-center justify-between px-4 py-5 md:px-8">
            <span id="text-story">{label}</span>
            <ChevronRight className="text-neutral-400" />
          </div>
        </div>
        <Separator />
      </div>
    );
  },
);

export const Option = memo(_Option);
