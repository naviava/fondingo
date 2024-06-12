"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";

interface IProps {
  title: string;
  href: string;
  text: string;
}

export function FooterLink({ href, text, title }: IProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li className="mx-auto w-full md:w-full">
      <Button
        asChild
        size="sm"
        variant="link"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full text-sm text-white md:w-fit md:pl-0 lg:text-base"
      >
        <Link href={href} target={title === "Social" ? "_blank" : undefined}>
          <div className="relative">
            {text}
            <AnimatePresence mode="popLayout">
              {title === "Social" && isHovered && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: 20,
                    y: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: 20,
                    y: -20,
                  }}
                  className="absolute -right-6 top-[2px] translate-y-1/2"
                >
                  <ExternalLink className="ml-2 h-4 w-4 text-neutral-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </Button>
    </li>
  );
}
