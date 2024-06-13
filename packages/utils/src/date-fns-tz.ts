import { format } from "date-fns-tz";

export * from "date-fns-tz";
export function formatDate(dateStamp: Date | string, code: string) {
  return format(new Date(dateStamp), code);
}
