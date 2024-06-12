import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to FSplit",
};

interface IProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: IProps) {
  const session = await getServerSession();
  if (!!session && !!session.user && !!session.user.email)
    return redirect("/groups");

  return (
    <div
      className="flex h-full flex-col bg-cover bg-left-top bg-no-repeat transition-all duration-500 md:bg-center"
      style={{
        backgroundImage: "url(/images/auth-bg.jpg)",
      }}
    >
      <div className="flex h-full flex-col backdrop-blur-md">
        <div className="bg-black50 absolute inset-0 z-[1]" />
        {/* <div>Header</div> */}
        <div className="flex-1">{children}</div>
        {/* <div>Footer</div> */}
      </div>
    </div>
  );
}
