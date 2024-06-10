import Link from "next/link";

import { MainBannerHeading } from "./main-banner-heading";
import { BlurImageLoader } from "../blur-image-loader";
import { ArrowRight } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";

import bannerImage from "~/public/images/wide-phone-banner.png";
import { archivo, hfont } from "~/utils";
import { cn } from "@fondingo/ui/utils";

export function MainBanner() {
  return (
    <div
      className={cn(
        "mt-16 flex flex-col items-center md:flex-row xl:mt-0",
        archivo.className,
      )}
    >
      <MainBannerHeading className="md:hidden" />
      <div className="relative aspect-square w-full flex-1">
        <BlurImageLoader fill image={bannerImage} alt="Welcome to FSplit" />
      </div>
      <div className="flex-1 space-y-10">
        <MainBannerHeading className="hidden md:block" />
        <p className="mx-auto hidden pl-1 text-center text-gray-500 md:block md:max-w-[70%] md:text-left md:text-lg lg:text-xl">
          FSplit makes it easy to track expenses, split bills, and get paid back
          by your friends and family.
        </p>
        <div className="mx-auto pl-1 md:max-w-[70%]">
          <Button
            asChild
            variant="cta"
            className={cn("w-full rounded-full px-8 md:w-fit", hfont.className)}
          >
            <Link href="/signin">
              Explore the app
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
