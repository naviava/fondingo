import { format } from "@fondingo/utils/date-fns";

interface IProps {
  createdAt: Date;
}

export function EntryDate({ createdAt }: IProps) {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center text-sm font-medium">
      <p>{format(new Date(createdAt), "LLL")}</p>
      <p>{format(new Date(createdAt), "d")}</p>
    </div>
  );
}
