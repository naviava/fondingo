import { ChevronLeft } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import Link from "next/link";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";

interface IProps {
  groupId: string;
}

export function PageHeader({ groupId }: IProps) {
  return (
    <section className="relative flex items-center justify-center px-2 pt-6">
      <h1 className={cn("text-lg font-semibold", hfont.className)}>
        Group Settings
      </h1>
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
