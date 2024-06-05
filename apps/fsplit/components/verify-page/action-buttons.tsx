"use client";

import { Button } from "@fondingo/ui/button";

interface IProps {}

export function ActionButtons({}: IProps) {
  return (
    <div className="flex items-center justify-center gap-x-6">
      <Button variant="cta" className="w-[9rem]">
        Resend Email
      </Button>
      <Button variant="ctaOutline" className="w-[9rem]">
        Contact us
      </Button>
    </div>
  );
}
