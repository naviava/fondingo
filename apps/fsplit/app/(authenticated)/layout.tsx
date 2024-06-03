import { Navbar } from "~/components/navbar";

interface IProps {
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({ children }: IProps) {
  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-xl flex-col overflow-y-hidden bg-[#F4F4F4]">
      {children}
      <Navbar />
    </div>
  );
}
