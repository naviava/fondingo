import { useEffect, useRef } from "react";
import { usePanelHeight } from "@fondingo/store/use-panel-height";

export function useTopRef() {
  const topDivRef = useRef<HTMLDivElement>(null);
  const { setTopRef } = usePanelHeight((state) => state);

  useEffect(() => {
    function updateTopDivPosition() {
      const topDiv = topDivRef.current?.getBoundingClientRect();
      setTopRef(topDiv?.bottom);
    }
    updateTopDivPosition();
    window.addEventListener("resize", updateTopDivPosition);
    return () => window.removeEventListener("resize", updateTopDivPosition);
  }, [setTopRef]);

  return { topDivRef };
}
