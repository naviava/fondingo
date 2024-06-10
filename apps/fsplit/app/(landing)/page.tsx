import { KeyFeatures } from "~/components/landing-page/key-features";
import { MainBanner } from "~/components/landing-page/main-banner";
import { WhyFSplit } from "~/components/landing-page/why-fsplit";
import { CTABanner } from "~/components/landing-page/cta-banner";
import { Quote } from "~/components/landing-page/quote";

export default function LandingPage() {
  return (
    <>
      <MainBanner />
      <KeyFeatures />
      <WhyFSplit />
      <CTABanner />
      <Quote />
    </>
  );
}
