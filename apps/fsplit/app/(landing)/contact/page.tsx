"use client";

import Image from "next/image";

import { LandingLayoutWrapper } from "~/components/landing-layout-wrapper";
import { ContactForm } from "~/components/contact-form";
import { motion, useAnimate } from "framer-motion";
import { useEffect, useRef } from "react";

export default function ContactPage() {
  const isMounted = useRef(true);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isMounted.current || !scope.current) {
        clearInterval(interval);
        return;
      }
      await animate(
        scope.current,
        { scale: 1.1, rotate: 360 },
        { duration: 2 },
      );
      await animate(scope.current, { scale: 1, rotate: 0 }, { duration: 2 });
      await animate(scope.current, { scale: 0 }, { duration: 1 });
      await animate(scope.current, { scale: 1 }, { duration: 1 });
    }, 2000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [animate, scope]);

  return (
    <LandingLayoutWrapper className="justify-start px-0 py-0">
      <div className="h-[20vh] w-full bg-neutral-200" />
      <div className="mx-auto flex w-full max-w-screen-xl -translate-y-28 items-center px-4 lg:gap-x-6">
        <div className="mx-auto w-full max-w-lg rounded-md border-2 border-neutral-300 bg-[#F4F4F4] p-10 shadow-lg xl:p-14">
          <div className="flex items-center">
            <motion.div
              ref={scope}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1 }}
              className="relative aspect-square w-10 md:w-12 lg:w-14"
            >
              <Image fill src="/images/mailbox.svg" alt="Drop us a line" />
            </motion.div>
            <h1 className="ml-4 text-2xl font-semibold md:text-3xl lg:text-4xl">
              Drop us a line
            </h1>
          </div>
          <ContactForm />
        </div>
        <div className="relative hidden aspect-square lg:block lg:w-full lg:flex-1">
          <Image fill src="/images/contact-us.svg" alt="Contact us" />
        </div>
      </div>
    </LandingLayoutWrapper>
  );
}
