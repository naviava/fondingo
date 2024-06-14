"use client";

import { formatDate } from "@fondingo/utils/date-fns-tz";
import { Separator } from "@fondingo/ui/separator";
import { hexToRgb } from "~/utils";

interface IProps {
  message: string;
  createdAt: Date;
  group?: {
    name?: string | undefined;
    color?: string | undefined;
  };
}

export function LogEntry({ message, createdAt, group }: IProps) {
  return (
    <li>
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
          <div className="flex items-center gap-x-2 text-xs">
            <span className="text-neutral-500">
              {formatDate(createdAt, "h:mm a")}
            </span>
            {group?.name && group.color && (
              <span
                className="max-w-[15rem] truncate rounded-full px-2 font-medium md:max-w-[25rem]"
                style={{
                  border: `1px solid ${group.color}`,
                  backgroundColor: `${hexToRgb(group.color, 0.1)}`,
                }}
              >
                {group.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
