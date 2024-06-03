import { formatDate } from "@fondingo/utils/date-fns";
import { Separator } from "@fondingo/ui/separator";

interface IProps {
  message: string;
  createdAt: Date;
}

export function LogEntry({ message, createdAt }: IProps) {
  return (
    <>
      <Separator />
      <div className="flex items-center gap-x-6 p-4">
        <div className="flex flex-col items-center justify-center text-xs font-medium text-neutral-500">
          <span>{formatDate(createdAt, "E")}</span>
          <span className="text-cta text-xl md:text-2xl">
            {formatDate(createdAt, "d")}
          </span>
          <span>{formatDate(createdAt, "MMM")}</span>
        </div>
        <div className="space-y-1">
          <p className="line-clamp-2 text-sm md:text-base">{message}</p>
          <p className="text-xs text-neutral-500">
            {formatDate(createdAt, "h:mm a")}
          </p>
        </div>
      </div>
    </>
  );
}
