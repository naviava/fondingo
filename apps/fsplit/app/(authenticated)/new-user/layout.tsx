import { redirect } from "next/navigation";
import { mergeUserAccounts } from "~/utils/merge-user-accounts";

export default async function NewUserLayout() {
  await mergeUserAccounts();
  return redirect("/groups");
}
