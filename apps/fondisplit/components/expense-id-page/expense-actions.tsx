import { Button } from "@fondingo/ui/button";
import { Pencil, Trash2 } from "@fondingo/ui/lucide";

interface IProps {}

export function ExpenseActions({}: IProps) {
  return (
    <div className="flex items-center gap-x-1">
      <Button size="sm" variant="ghost">
        <Trash2 />
      </Button>
      <Button size="sm" variant="ghost">
        <Pencil />
      </Button>
    </div>
  );
}
