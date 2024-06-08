import Image from "next/image";
import { LandingPageNavbar } from "~/components/landing-page/navbar";

export default function Page() {
  return (
    <div className="flex min-h-full flex-col bg-[#F4F4F4]">
      <div className="h-screen w-full">
        <LandingPageNavbar />
        <div className="relative aspect-square h-[calc(100vh-56px)]">
          <Image
            fill
            src="/images/wide-phone-banner.png"
            alt="Welcome to FSplit"
            className="object-cover"
          />
        </div>
      </div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
      <div>A</div>
    </div>
  );
}
