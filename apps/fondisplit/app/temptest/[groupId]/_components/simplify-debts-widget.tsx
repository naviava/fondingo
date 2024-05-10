"use client";

import { useParams, useRouter } from "next/navigation";
import { calculateSimplifiedDebts } from "~/lib/actions";

export function SimplifyDebtsWidget() {
  const router = useRouter();
  const params: { groupId: string } = useParams();

  function handleSimplifyDebts() {
    if (!params.groupId) return;
    calculateSimplifiedDebts(params.groupId);
    router.refresh();
  }

  return (
    <button
      onClick={handleSimplifyDebts}
      className="rounded-lg bg-blue-500 p-2"
    >
      Simplify debts
    </button>
  );
}
