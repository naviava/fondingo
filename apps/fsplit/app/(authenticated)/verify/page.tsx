import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { NoToken } from "~/components/verify-page/no-token";
import { serverClient } from "~/lib/trpc/server-client";

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

  const response = await serverClient.user.completeVerification(
    searchParams.token,
  );
  if (response) return redirect("/groups");
  return <NoToken email={session.user.email} isExpired />;
}
