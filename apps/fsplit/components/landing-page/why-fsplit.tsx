"use client";

import { Button } from "@fondingo/ui/button";
import { ArrowRight } from "@fondingo/ui/lucide";
import { cn } from "@fondingo/ui/utils";
import { uuid } from "@fondingo/utils/uuid";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { archivo, hfont } from "~/utils";

const ENTRIES = [
  {
    id: uuid(),
    icon: "/images/why-fsplit-1.svg",
    title: "User-Friendly Interface",
    description:
      "FSplit is designed with simplicity in mind. Our intuitive interface ensures you can manage your group expenses without any hassle.",
  },
  {
    id: uuid(),
    icon: "/images/why-fsplit-2.svg",
    title: "Secure and Reliable",
    description:
      "We take your privacy seriously. FSplit uses end-to-end encryption to ensure your data is safe and secure.",
  },
  {
    id: uuid(),
    icon: "/images/why-fsplit-3.svg",
    title: "Anytime, Anywhere",
    description:
      "FSplit is available on all platforms. Whether you're on iOS, Android, or the web, you can access your group expenses anytime, anywhere.",
  },
];

export function WhyFSplit() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev === ENTRIES.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("mt-52", archivo.className)}>
      <h2 className="lg:leading-tighter mx-auto text-center text-3xl font-bold tracking-tighter sm:text-4xl md:max-w-[70%] md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
        Why <span className="text-cta">FS</span>plit?
      </h2>
      <div className="mx-auto flex flex-col md:mt-16 md:flex-row lg:mt-0 lg:items-center">
        <div className="relative aspect-square w-full flex-1">
          <Image fill src="/images/tall-phone-banner.png" alt="FSPlit" />
        </div>
        <div className="mt-6 w-full flex-1">
          <ul className="mx-auto flex h-16 w-full max-w-[500px] items-center justify-between gap-x-4 px-12">
            {ENTRIES.map((entry, idx) => {
              const isActive = activeIndex === idx;
              return (
                <li
                  key={entry.id}
                  className={cn(
                    "relative aspect-square w-10 transition-all duration-500 xl:w-14",
                    isActive && "w-16 xl:w-[80px]",
                  )}
                >
                  <Image fill src={entry.icon} alt={entry.title} />
                </li>
              );
            })}
          </ul>
          <div className="mt-10 p-4 xl:mt-16">
            <h3 className="text-center text-2xl font-bold lg:text-4xl xl:text-5xl">
              {ENTRIES[activeIndex]?.title}
            </h3>
            <p className="mx-auto mt-4 h-24 max-w-xl text-center text-neutral-500 lg:mt-8 xl:mt-12 xl:text-xl">
              {ENTRIES[activeIndex]?.description}
            </p>
          </div>
          <div className="mx-auto w-fit px-4 xl:mt-12">
            <Button
              asChild
              variant="cta"
              className={cn("w-[10rem] rounded-full", hfont.className)}
            >
              <Link href="/signin">
                Sign up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
