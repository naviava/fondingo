import { create } from "zustand";

type PanelHeightStore = {
  topRef: number;
  setTopRef: (ref: number | undefined) => void;

  bottomRef: number;
  setBottomRef: (ref: number | undefined) => void;
};

export const usePanelHeight = create<PanelHeightStore>((set) => ({
  topRef: 0,
  setTopRef: (ref) =>
    set((state) => ({
      ...state,
      topRef: ref,
    })),

  bottomRef: 0,
  setBottomRef: (ref) =>
    set((state) => ({
      ...state,
      bottomRef: ref,
    })),
}));
