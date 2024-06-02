import { create } from "zustand";

type PanelHeightStore = {
  panelHeight: number;
  topRef: number;
  setTopRef: (ref: number | undefined) => void;

  bottomRef: number;
  setBottomRef: (ref: number | undefined) => void;
};

export const usePanelHeight = create<PanelHeightStore>((set) => ({
  panelHeight: 0,
  topRef: 0,
  setTopRef: (ref) =>
    set((state) => ({
      ...state,
      topRef: ref,
      panelHeight: !!ref ? state.bottomRef - ref : 0,
    })),

  bottomRef: 0,
  setBottomRef: (ref) =>
    set((state) => ({
      ...state,
      bottomRef: ref,
      panelHeight: !!ref ? ref - state.topRef : 0,
    })),
}));
