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
  const isLoggedIn = !!session && !!session.user && !!session.user.email;

  const token = searchParams?.token ?? "";
  if (!token && !isLoggedIn) return redirect("/signin");
  if (!token && isLoggedIn) return <TokenState />;

  const existingToken = await serverClient.user.getVerificationToken(token);
  if (!existingToken) return <TokenState title="Invalid token" isInvalid />;
  if (Date.now() > new Date(existingToken.expires).getTime())
    return <TokenState title="Expired token" isExpired />;

  const response = await serverClient.user.completeVerification(
    searchParams?.token || "",
  );
  if (response) return redirect("/groups");

  return <TokenState title="Unexpected error" isError />;
}
