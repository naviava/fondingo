import { formatDate } from "@fondingo/utils/date-fns-tz";

interface IProps {
  createdAt: Date;
}

export function EntryDate({ createdAt }: IProps) {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center text-sm font-medium">
      <p>{formatDate(createdAt, "LLL")}</p>
      <p>{formatDate(createdAt, "d")}</p>
    </div>
  );
}
