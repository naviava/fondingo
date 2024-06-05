import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { NoToken } from "~/components/verify-page/no-token";

interface IProps {
  searchParams?: {
    token?: string;
  };
}

export default async function VerifyPage({ searchParams }: IProps) {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email)
    return redirect("/signin");

  if (!searchParams?.token) return <NoToken email={session.user.email} />;
}
