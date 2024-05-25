import { ChevronLeft } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import Link from "next/link";

interface IProps {
  groupId: string;
}

export function PageHeader({ groupId }: IProps) {
  return (
    <section className="relative flex items-center justify-center px-2 pt-6">
      <h1 className="text-lg font-semibold">Group Settings</h1>
      <div className="absolute left-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
        >
          <Link href={`/groups/${groupId}`}>
            <ChevronLeft />
          </Link>
        </Button>
      </div>
    </section>
  );
}
