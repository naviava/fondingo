import { formatInTimeZone } from "date-fns-tz";

export * from "date-fns-tz";
export function formatDate(dateStamp: Date | string, code: string) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return formatInTimeZone(new Date(dateStamp), timeZone, code);
}
