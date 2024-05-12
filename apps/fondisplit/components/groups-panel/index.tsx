import Image from "next/image";

export function GroupsPanel() {
  // TODO: Add the API call to fetch user groups.
  const groups = [];

  if (!groups.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-y-10 px-4 pb-24">
        <Image
          src="empty-illustration.svg"
          alt="No groups yet"
          height={300}
          width={300}
        />
        <p>
          <div className="text-muted-foreground space-y-2 text-center italic">
            <p>You don't have any groups yet.</p>
            <p>Click the "Create Group" button to get started.</p>
          </div>
        </p>
      </div>
    );
  }

  return <div className="flex-1 px-4 pb-24">GroupsPanel</div>;
}
