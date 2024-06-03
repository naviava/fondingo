import { format } from "date-fns";

export * from "date-fns";
export function formatDate(dateStamp: Date | string, code: string) {
  return format(new Date(dateStamp), code);
}
