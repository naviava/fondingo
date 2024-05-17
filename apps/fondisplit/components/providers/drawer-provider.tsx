"use client";

import { useEffect, useState } from "react";
import { ExpensePaymentsDrawer } from "../drawers/expense-payments-drawer";

export function DrawerProvider() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <>
      <ExpensePaymentsDrawer />
    </>
  );
}
