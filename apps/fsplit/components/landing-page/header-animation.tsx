"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function HeaderAnimation() {
  const [toggleState, setToggleState] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setToggleState((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <h2 className="text-balance text-4xl font-bold leading-[1.5em]  md:flex-row md:text-5xl md:leading-[1.5em] lg:text-6xl lg:leading-[1.5em]">
      <div className="flex flex-col items-center gap-y-2 md:gap-y-4">
        <div>Start Managing Your Expenses</div>
        <div className="relative mx-auto w-fit">
          <AnimatePresence mode="sync">
            {toggleState && (
              <motion.div
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0, originX: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 rounded-lg bg-emerald-500"
              />
            )}
          </AnimatePresence>
          <div className="relative px-2">Today</div>
        </div>
      </div>
    </h2>
  );
}
