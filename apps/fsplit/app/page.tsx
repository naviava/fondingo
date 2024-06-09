import { LandingPageNavbar } from "~/components/landing-page/navbar";
import { KeyFeatures } from "~/components/landing-page/key-features";
import { MainBanner } from "~/components/landing-page/main-banner";
import { WhyFSplit } from "~/components/landing-page/why-fsplit";
import { CTABanner } from "~/components/landing-page/cta-banner";
import { Footer } from "~/components/landing-page/footer";
import { Quote } from "~/components/landing-page/quote";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-[#F4F4F4]">
      <div className="w-full">
        <LandingPageNavbar />
        <MainBanner />
        <KeyFeatures />
        <WhyFSplit />
        <CTABanner />
        <Quote />
        <Footer />
      </div>
    </div>
  );
}
