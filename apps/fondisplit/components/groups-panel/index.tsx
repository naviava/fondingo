import Image from "next/image";
import Link from "next/link";
import { serverClient } from "~/lib/trpc/server-client";

interface IProps {
  groups: Awaited<ReturnType<typeof serverClient.group.getGroups>>;
}

export function GroupsPanel({ groups = [] }: IProps) {
  // Empty state
  if (!groups.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-y-8 px-4 pb-24">
        <div>
          <Image
            src="empty-illustration.svg"
            alt="No groups yet"
            height={300}
            width={300}
          />
          <p className="-mt-7 mr-4 text-right text-xs">
            <a
              target="_blank"
              href="https://www.freepik.com/free-vector/shrug-concept-illustration_24488080.htm#query=nothing&position=0&from_view=keyword&track=sph&uuid=cd8a18b9-0346-4a07-aca9-cbc4fdd5d47a"
            >
              Image by storyset
            </a>{" "}
            on Freepik
          </p>
        </div>
        <div className="text-muted-foreground space-y-2 text-center italic">
          <p>You don't have any groups yet.</p>
          <p>Click the "Create Group" button to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex-1 px-4 pb-24">
      {groups.map((group) => (
        <Link key={group.id} href={`/groups/${group.id}`}>
          <div>{group.name}</div>
        </Link>
      ))}
    </section>
  );
}
