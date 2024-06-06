import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { TokenState } from "~/components/verify-page/token-state";
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

  if (!searchParams?.token) return <TokenState email={session.user.email} />;

  const tokenExists = await serverClient.user.getVerificationToken(
    searchParams.token,
  );
  if (!tokenExists)
    return (
      <TokenState title="Invalid token" email={session.user.email} isInvalid />
    );
  if (Date.now() > new Date(tokenExists.expires).getTime())
    return (
      <TokenState title="Expired token" email={session.user.email} isExpired />
    );

  const response = await serverClient.user.completeVerification(
    searchParams.token,
  );
  if (response) return redirect("/groups");

  return (
    <TokenState title="Unexpected error" email={session.user.email} isError />
  );
}
