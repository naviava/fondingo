import Link from "next/link";
import { Button } from "@fondingo/ui/button";

export default function CreateGroupPage() {
  return (
    <>
      <div className="flex items-center justify-between pt-4">
        <Button asChild variant="splitGhost">
          <Link href="/groups">Cancel</Link>
        </Button>
        <h1 className="text-lg font-semibold">Create a group</h1>
        <Button variant="splitGhost">Done</Button>
      </div>
      <div className="my-10 px-4">Define group details</div>
      <div className="px-4">Type</div>
    </>
  );
}
