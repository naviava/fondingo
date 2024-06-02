import { redirect } from "next/navigation";
import { mergeUserAccounts } from "~/utils/merge-user-account";

export default async function NewUserLayout() {
  await mergeUserAccounts();
  return redirect("/groups");
}
