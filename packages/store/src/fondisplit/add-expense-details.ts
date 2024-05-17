import { create } from "zustand";

type ExpenseDetails = {
  groupId: string;
  expenseName: string;
  expenseAmount: number;
  setGroupId: (groupId: string) => void;
  setExpenseName: (expenseName: string) => void;
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
  onPaymentsDrawerOpen: () => void;
  onPaymentsDrawerClose: () => void;

  isSplitsDrawerOpen: boolean;
  onSplitsDrawerOpen: () => void;
  onSplitsDrawerClose: () => void;
};

export const useExpenseDetails = create<ExpenseDetails>((set) => ({
  groupId: "",
  expenseName: "",
  expenseAmount: 0,
  setExpenseName: (expenseName) => set({ expenseName }),
  setExpenseAmount: (expenseAmount) =>
    set({ expenseAmount: Number(expenseAmount) }),
  setGroupId: (groupId) => set({ groupId }),

  payments: [],
  setPayments: (payments) => set({ payments }),
  clearPayments: () => set({ payments: [] }),

  splitType: "equally" as const,
  splits: [],
  setSplits: (splits) => set({ splits }),
  clearSplits: () => set({ splits: [] }),

  breakPoint: 0,

  isPaymentsDrawerOpen: false,
  onPaymentsDrawerOpen: () =>
    set({ isPaymentsDrawerOpen: true, breakPoint: Date.now() }),
  onPaymentsDrawerClose: () => {
    set((state) => {
      if (Date.now() - state.breakPoint < 100) {
        return { isPaymentsDrawerOpen: true };
      }
      return { isPaymentsDrawerOpen: false };
    });
  },

  isSplitsDrawerOpen: false,
  onSplitsDrawerOpen: () =>
    set({ isSplitsDrawerOpen: true, breakPoint: Date.now() }),
  onSplitsDrawerClose: () => {
    set((state) => {
      if (Date.now() - state.breakPoint < 100) {
        return { isSplitsDrawerOpen: true };
      }
      return { isSplitsDrawerOpen: false };
    });
  },
}));
