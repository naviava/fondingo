import { SimpleTitleTopRef } from "~/components/simple-title-top-ref";
import { DynamicScrollArea } from "@fondingo/ui/dynamic-scroll-area";
import { Separator } from "@fondingo/ui/separator";
import { LogEntry } from "~/components/log-entry";

import { serverClient } from "~/lib/trpc/server-client";

export default async function ActivityPage() {
  const logs = await serverClient.logs.userLogs();

  return (
    <div className="h-full pb-24">
      <SimpleTitleTopRef title="Recent activity" />
      <DynamicScrollArea>
        {logs.map((log) => (
          <LogEntry
            key={log.id}
            message={log.message}
            createdAt={log.createdAt}
          />
        ))}
        <Separator />
      </DynamicScrollArea>
    </div>
  );
}
