import { create } from "zustand";

type PanelHeightStore = {
  topRef: number | undefined;
  setTopRef: (ref: number | undefined) => void;

  bottomRef: number | undefined;
  setBottomRef: (ref: number | undefined) => void;
};

export const usePanelHeight = create<PanelHeightStore>((set) => ({
  topRef: undefined,
  setTopRef: (ref) => set({ topRef: ref }),

  bottomRef: undefined,
  setBottomRef: (ref) => set({ bottomRef: ref }),
}));
