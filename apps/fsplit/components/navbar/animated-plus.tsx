"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@fondingo/ui/button";
import { motion } from "framer-motion";
import { useAnimation } from "~/hooks/use-animation";

export function AnimatedPlus() {
  const router = useRouter();
  const params = useParams();
  const { scope, scaleAndRotate } = useAnimation();

  const handleClick = useCallback(() => {
    scaleAndRotate();
    if (!!params.groupId) {
      return router.push(`/groups/${params.groupId}/expense`);
    }
    return router.push("/create-group");
  }, [params.groupId, router, scaleAndRotate]);

  return (
    <Button
      ref={scope}
      type="button"
      variant="cta"
      onClick={handleClick}
      className="aspect-square h-full px-3"
    >
      <motion.div
        id="scaleAndRotate"
        className="flex h-full w-full items-center justify-center text-[60px] font-light"
      >
        +
      </motion.div>
    </Button>
  );
}
