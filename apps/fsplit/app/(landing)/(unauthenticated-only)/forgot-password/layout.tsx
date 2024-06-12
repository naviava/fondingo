import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password?",
  description:
    "Forgot your password? No worries, we got you covered. Just enter your email and we'll send you a link to reset your password.",
};

interface IProps {
  children: React.ReactNode;
}

export default function ForgotPasswordLayout({ children }: IProps) {
  return <>{children}</>;
}
