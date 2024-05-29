"use client";

import { ChevronRight } from "@fondingo/ui/lucide";
import { Separator } from "@fondingo/ui/separator";

interface IProps {
  label: string;
  onClick?: () => void;
}

export function Option({ label, onClick }: IProps) {
  return (
    <div>
      <div role="button" onClick={onClick} className="hover:bg-neutral-200">
        <div className="flex items-center justify-between px-4 py-5 md:px-8">
          <p>{label}</p>
          <ChevronRight className="text-neutral-400" />
        </div>
      </div>
      <Separator />
    </div>
  );
}
