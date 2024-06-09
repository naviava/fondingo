import { LandingPageNavbar } from "~/components/landing-page/navbar";
import { MainBanner } from "~/components/landing-page/main-banner";

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#F4F4F4]">
      <div className="min-h-screen w-full">
        <LandingPageNavbar />
        <MainBanner />
      </div>
    </div>
  );
}
