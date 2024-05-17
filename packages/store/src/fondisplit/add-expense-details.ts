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
  splits: {
    userId: string;
    userName: string;
    amount: number;
  }[];
  splitType: "equally" | "custom";
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
  splits: [],
  splitType: "equally",
}));
