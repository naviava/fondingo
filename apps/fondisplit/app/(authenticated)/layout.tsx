import { Navbar } from "~/components/navbar";

interface IProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: IProps) {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-xl flex-col bg-[#F4F4F4]">
      {children}
      <Navbar />
    </div>
  );
}
