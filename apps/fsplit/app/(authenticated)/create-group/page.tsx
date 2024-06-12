import { GroupForm } from "~/components/forms/group-form";

export const metadata = {
  title: "Create a new group",
  description: "Create a new group to share expenses with friends.",
};

export default function CreateGroupPage() {
  return <GroupForm />;
}
