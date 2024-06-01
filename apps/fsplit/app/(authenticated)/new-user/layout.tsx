import { redirect } from "next/navigation";
import { mergeUserAccounts } from "~/utils/merge-user-account";

interface IProps {
  children: React.ReactNode;
}

export default async function NewUserLayout({ children }: IProps) {
  await mergeUserAccounts();
  return redirect("/groups");
}
