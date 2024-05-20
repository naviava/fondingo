"use client";

import { serverClient } from "~/lib/trpc/server-client";
import { ChevronLeft } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import Link from "next/link";

interface IProps {
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
}

export function SettleUpClient({ group }: IProps) {
  return (
    <>
      <div className="flex items-center justify-between px-2 pt-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/groups/${group.id}`}>
            <ChevronLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Record a payment</h1>
        <Button variant="splitGhost" size="sm">
          Save
        </Button>
      </div>
      <section className="flex h-full flex-col items-center justify-center pb-24">
        A
      </section>
    </>
  );
}
