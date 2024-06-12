import { Metadata } from "next";

import { serverClient } from "~/lib/trpc/server-client";
import { getServerSession } from "next-auth";

import { SimpleTitleTopRef } from "~/components/simple-title-top-ref";
import { DynamicScrollArea } from "@fondingo/ui/dynamic-scroll-area";
import { Separator } from "@fondingo/ui/separator";
import { LogEntry } from "~/components/log-entry";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) return {};
  return {
    title: `Activity Log for ${session.user.name}`,
    description: `View your recent activity log.`,
  };
}

export default async function ActivityPage() {
  const userLogs = await serverClient.logs.userLogs();

  return (
    <div className="h-full pb-24">
      <SimpleTitleTopRef title="Recent activity" />
      <DynamicScrollArea crop={32}>
        <ul>
          {userLogs.map((log) => (
            <LogEntry
              key={log.id}
              message={log.message}
              createdAt={log.createdAt}
            />
          ))}
        </ul>
        <Separator />
      </DynamicScrollArea>
    </div>
  );
}
