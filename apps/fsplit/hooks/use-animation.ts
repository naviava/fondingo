import { useAnimate } from "framer-motion";
import { useCallback, useState } from "react";

export function useAnimation() {
  const [scope, animate] = useAnimate();
  const [animationText, setAnimationText] = useState("");

  const scaleAndShake = useCallback(async () => {
    if (!!scope.current) {
      await animate(scope.current, { scale: 1.1 }, { duration: 0.2 });
      for (let i = 0; i < 3; i++) {
        await animate(scope.current, { rotate: "5deg" }, { duration: 0.05 });
        await animate(scope.current, { rotate: "-5deg" }, { duration: 0.05 });
      }
      await animate(scope.current, { scale: 1, rotate: 0 });
    }
  }, [scope, animate]);

  const scaleAndRotate = useCallback(async () => {
    if (!!scope.current) {
      await animate("#scaleAndRotate", { scale: 0.8 }, { duration: 0.3 });
      await animate(
        "#scaleAndRotate",
        { rotate: "1080deg" },
        { duration: 0.7 },
      );
      await animate("#scaleAndRotate", { scale: 1 }, { duration: 0.2 });
      await animate("#scaleAndRotate", { rotate: "0deg" }, { duration: 0 });
    }
  }, [scope, animate]);

  const textStory = useCallback(
    async (texts: string[]) => {
      if (!texts || texts.length < 2) return;
      for (let i = 1; i < texts.length; i++) {
        await animate(
          "#text-story",
          { scale: 0, opacity: 0 },
          { duration: 0.7 },
        );
        setAnimationText(texts[i] ?? "");
        await animate("#text-story", { scale: 1 });
        await animate("#text-story", { opacity: 1 }, { duration: 0.7 });
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      await animate("#text-story", { scale: 0, opacity: 0 }, { duration: 0.7 });
      setAnimationText(texts[0] ?? "");
      await animate("#text-story", { scale: 1 });
      await animate("#text-story", { opacity: 1 }, { duration: 0.7 });
    },
    [animate, setAnimationText],
  );

  return {
    scope,
    animate,
    animationText,
    scaleAndShake,
    scaleAndRotate,
    textStory,
  };
}
