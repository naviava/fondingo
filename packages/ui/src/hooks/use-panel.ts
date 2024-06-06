import { useEffect, useRef } from "react";
import { usePanelHeight } from "@fondingo/store/use-panel-height";

export function usePanel() {
  const topDivRef = useRef<HTMLDivElement>(null);
  const bottomDivRef = useRef<HTMLDivElement>(null);
  const { panelHeight, setTopRef, setBottomRef } = usePanelHeight(
    (state) => state,
  );

  useEffect(() => {
    function updateTopDivPosition() {
      const topDiv = topDivRef.current?.getBoundingClientRect();
      setTopRef(topDiv?.bottom);
    }
    updateTopDivPosition();
    window.addEventListener("resize", updateTopDivPosition);
    return () => window.removeEventListener("resize", updateTopDivPosition);
  }, [setTopRef]);

  useEffect(() => {
    function updateBottomDivPosition() {
      const bottomDiv = bottomDivRef.current?.getBoundingClientRect();
      setBottomRef(bottomDiv?.top);
    }
    updateBottomDivPosition();
    window.addEventListener("resize", updateBottomDivPosition);
    return () => window.removeEventListener("resize", updateBottomDivPosition);
  }, [setBottomRef]);

  return { panelHeight, topDivRef, bottomDivRef };
}
