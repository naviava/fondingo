import { mergeUserAccounts } from "~/lib/merge-user-account";

interface IProps {
  children: React.ReactNode;
}

export async function NewUserLayout({ children }: IProps) {
  const promise = await mergeUserAccounts();
  return <>{children}</>;
}
