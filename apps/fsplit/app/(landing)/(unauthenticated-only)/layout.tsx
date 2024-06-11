import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

interface IProps {
  children: React.ReactNode;
}

export default async function UnauthenticatedLayout({ children }: IProps) {
  const session = await getServerSession();
  if (!!session && !!session.user && !!session.user.email)
    return redirect("/groups");

  return <>{children}</>;
}
