"use client";

import { useEffect, useState } from "react";

import { useSafeAnimate } from "~/hooks/use-safe-animate";
import { motion } from "framer-motion";

export function HeaderAnimation() {
  const [scope, animate] = useSafeAnimate();
  const [toggleState, setToggleState] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setToggleState((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function handleAnimation() {
      if (toggleState) {
        const animations = [
          animate(
            "#bg",
            { scaleX: 1, backgroundColor: "#11998E" },
            { duration: 1 },
          ),
          animate("#text", { color: "#fff" }, { duration: 1.5 }),
        ];
        await Promise.all(animations);
        // @ts-expect-error
        if (scope.current) await animate("#bg", { originX: 1 });
      }
      if (!toggleState) {
        const animations = [
          animate(
            "#bg",
            { scaleX: 0, backgroundColor: "#10b981" },
            { duration: 1 },
          ),
          animate("#text", { color: "#404040" }, { duration: 1 }),
        ];
        await Promise.all(animations);
        if (scope.current)
          // @ts-expect-error
          await animate("#bg", { originX: 0, backgroundColor: "#10b981" });
        await animate("#bg", { height: "100%" });
      }
    }
    handleAnimation();
  }, [toggleState, animate, scope]);

  return (
    <h2 className="text-balance text-4xl font-bold leading-[1.5em]  md:flex-row md:text-5xl md:leading-[1.5em] lg:text-6xl lg:leading-[1.5em]">
      <div className="flex flex-col items-center gap-y-2 md:gap-y-4">
        <div>Start Managing Your Expenses</div>
        <div ref={scope} className="relative mx-auto w-fit">
          <motion.div
            id="bg"
            initial={{ scaleX: 0, originX: 0, backgroundColor: "#10b981" }}
            className="absolute inset-0 rounded-lg"
          />
          <div id="text" className="relative px-2">
            Today
          </div>
        </div>
      </div>
    </h2>
  );
}
