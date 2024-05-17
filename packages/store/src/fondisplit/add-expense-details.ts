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

  splitType: "equally" | "custom";
  splits: {
    userId: string;
    userName: string;
    amount: number;
  }[];

  breakPoint: number;
  isPaymentsDrawerOpen: boolean;
  onPaymentsDrawerOpen: () => void;
  onPaymentsDrawerClose: () => void;
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

  splitType: "equally",
  splits: [],

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
}));
