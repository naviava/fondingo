import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description:
    "Provide your email address and we'll send you an email with a link to verify your account.",
};

interface IProps {
  children: React.ReactNode;
}

export default function VerificationLayout({ children }: IProps) {
  return <>{children}</>;
}
