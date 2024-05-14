"use client";

import { Button } from "@fondingo/ui/button";
import { X } from "@fondingo/ui/lucide";
import Link from "next/link";

interface IProps {
  params: { groupId: string };
}

export default function AddExpensePage({ params }: IProps) {
  return (
    <>
      <div className="flex items-center justify-between px-2 pt-4">
        <Button asChild variant="splitGhost">
          <Link href={`/groups/${params.groupId}`}>
            <X className="text-muted-foreground h-8 w-8" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Add an expense</h1>
        <Button
          type="button"
          variant="splitGhost"
          className="w-20"
          onClick={() => {}}
        >
          Save
        </Button>
      </div>
    </>
  );
}
