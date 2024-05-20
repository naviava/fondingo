"use client";

import { useEffect, useState } from "react";
import { ExpensePaymentsDrawer } from "../drawers/expense-payments-drawer";
import { ExpenseSplitsDrawer } from "../drawers/expense-splits-drawer";
import { SettlementDebtorsDrawer } from "../drawers/settlement-debtors-drawer copy";
import { SettlementCreditorsDrawer } from "../drawers/settlement-creditors-drawer";

export function DrawerProvider() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <>
      <ExpensePaymentsDrawer />
      <ExpenseSplitsDrawer />
      <SettlementDebtorsDrawer />
      <SettlementCreditorsDrawer />
    </>
  );
}
