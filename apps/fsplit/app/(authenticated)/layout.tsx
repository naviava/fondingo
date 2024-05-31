import { authOptions } from "~/lib/auth";
import { getServerSession } from "next-auth";

import { Navbar } from "~/components/navbar";
import { redirect } from "next/navigation";

interface IProps {
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({ children }: IProps) {
  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-xl flex-col bg-[#F4F4F4]">
      {children}
      <Navbar />
    </div>
  );
}
