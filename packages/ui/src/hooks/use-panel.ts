import { useEffect, useMemo, useRef } from "react";
import { usePanelHeight } from "@fondingo/store/use-panel-height";

export function usePanel() {
  const topDivRef = useRef<HTMLDivElement>(null);
  const bottomDivRef = useRef<HTMLDivElement>(null);
  const { topRef, bottomRef, setTopRef, setBottomRef } = usePanelHeight(
    (state) => state,
  );

  useEffect(() => {
    function updateTopDivPosition() {
      if (!!topDivRef.current) {
        const topDiv = topDivRef.current?.getBoundingClientRect();
        setTopRef(topDiv?.bottom);
      }
    }
    updateTopDivPosition();
    window.addEventListener("resize", updateTopDivPosition);
    return () => window.removeEventListener("resize", updateTopDivPosition);
  }, [setTopRef, topDivRef]);

  useEffect(() => {
    function updateBottomDivPosition() {
      if (bottomDivRef.current) {
        const bottomDiv = bottomDivRef.current?.getBoundingClientRect();
        setBottomRef(bottomDiv?.top);
      }
    }
    updateBottomDivPosition();
    window.addEventListener("resize", updateBottomDivPosition);
    return () => window.removeEventListener("resize", updateBottomDivPosition);
  }, [setBottomRef, bottomDivRef]);

  const panelHeight = useMemo(() => bottomRef - topRef, [bottomRef, topRef]);

  return { panelHeight, topDivRef, bottomDivRef };
}
