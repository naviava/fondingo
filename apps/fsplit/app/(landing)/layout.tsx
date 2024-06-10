import { Footer } from "~/components/landing-page/footer";
import { LandingPageNavbar } from "~/components/landing-page/navbar";

interface IProps {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: IProps) {
  return (
    <div className="w-full bg-[#F4F4F4]">
      <LandingPageNavbar />
      {children}
      <Footer />
    </div>
  );
}
