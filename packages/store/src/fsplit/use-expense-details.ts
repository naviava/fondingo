import { create } from "zustand";
import { TCurrencyCode } from "@fondingo/db-split";

type ExpenseDetails = {
  groupId: string;

  currency: TCurrencyCode;
  setCurrency: (currency: TCurrencyCode) => void;

  expenseName: string;
  setExpenseName: (expenseName: string) => void;

  expenseAmount: number;
  setExpenseAmount: (expenseAmount: number) => void;

  payments: {
    userId: string;
    userName: string;
    amount: number;
  }[];
  setPayments: (
    payments: {
      userId: string;
      userName: string;
      amount: number;
    }[],
  ) => void;
  clearPayments: () => void;

  splitType: "equally" | "custom";
  setSplitType: (splitType: "equally" | "custom") => void;

  splits: {
    userId: string;
    userName: string;
    amount: number;
  }[];
  setSplits: (
    splits: {
      userId: string;
      userName: string;
      amount: number;
    }[],
  ) => void;
  clearSplits: () => void;

  breakPoint: number;

  isPaymentsDrawerOpen: boolean;
  onPaymentsDrawerOpen: (groupId: string) => void;
  onPaymentsDrawerClose: () => void;

  isSplitsDrawerOpen: boolean;
  onSplitsDrawerOpen: (groupId: string) => void;
  onSplitsDrawerClose: () => void;

  clearExpenseDetails: () => void;
};

export const useExpenseDetails = create<ExpenseDetails>((set) => ({
  groupId: "",

  currency: "USD",
  setCurrency: (currency) => set((state) => ({ ...state, currency })),

  expenseName: "",
  setExpenseName: (expenseName) => set((state) => ({ ...state, expenseName })),

  expenseAmount: 0,
  setExpenseAmount: (expenseAmount) =>
    set((state) => ({
      ...state,
      expenseAmount: Math.floor(Number(expenseAmount) * 100) / 100,
    })),

  payments: [],
  setPayments: (payments) => set((state) => ({ ...state, payments })),
  clearPayments: () => set((state) => ({ ...state, payments: [] })),

  splitType: "equally" as const,
  setSplitType: (splitType) => set((state) => ({ ...state, splitType })),

  splits: [],
  setSplits: (splits) => set((state) => ({ ...state, splits })),
  clearSplits: () => set((state) => ({ ...state, splits: [] })),

  breakPoint: 0,

  isPaymentsDrawerOpen: false,
  onPaymentsDrawerOpen: (groupId: string) =>
    set((state) => ({
      ...state,
      groupId,
      isPaymentsDrawerOpen: true,
      breakPoint: Date.now(),
    })),
  onPaymentsDrawerClose: () => {
    set((state) => {
      if (Date.now() - state.breakPoint < 100) {
        return { ...state, isPaymentsDrawerOpen: true };
      }
      return { ...state, groupId: "", isPaymentsDrawerOpen: false };
    });
  },

  isSplitsDrawerOpen: false,
  onSplitsDrawerOpen: (groupId: string) =>
    set((state) => ({
      ...state,
      groupId,
      isSplitsDrawerOpen: true,
      breakPoint: Date.now(),
    })),
  onSplitsDrawerClose: () => {
    set((state) => {
      if (Date.now() - state.breakPoint < 100) {
        return { ...state, isSplitsDrawerOpen: true };
      }
      return { ...state, groupId: "", isSplitsDrawerOpen: false };
    });
  },

  clearExpenseDetails: () =>
    set({
      groupId: "",
      currency: "USD",
      expenseName: "",
      expenseAmount: 0,
      payments: [],
      splits: [],
      splitType: "equally",
      isPaymentsDrawerOpen: false,
      isSplitsDrawerOpen: false,
    }),
}));
