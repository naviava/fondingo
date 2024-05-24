import { serverClient } from "~/lib/trpc/server-client";

interface IProps {
  initialData: Awaited<
    ReturnType<typeof serverClient.group.getDebtsByMemberId>
  >;
}

export function DebtEntry({ initialData }: IProps) {
  return <div>debt-entry</div>;
}
