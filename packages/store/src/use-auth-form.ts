import { create } from "zustand";

type AuthFormStore = {
  formType: "register" | "signin";
  toggleType: () => void;
};

export const useAuthForm = create<AuthFormStore>((set) => ({
  formType: "signin",
  toggleType: () =>
    set((state) => ({
      formType: state.formType === "signin" ? "register" : "signin",
    })),
}));
