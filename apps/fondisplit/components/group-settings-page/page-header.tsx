"use client";

import { useRouter } from "next/navigation";

import { ChevronLeft } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";

export function PageHeader() {
  const router = useRouter();

  return (
    <section className="relative flex items-center justify-center px-2 pt-6">
      <h1 className="text-lg font-semibold">Group Settings</h1>
      <div className="absolute left-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground"
        >
          <ChevronLeft />
        </Button>
      </div>
    </section>
  );
}
