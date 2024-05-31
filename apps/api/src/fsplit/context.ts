import splitdb from "@fondingo/db-split";

export type Context = ReturnType<typeof createContext>;
export function createContext() {
  return { splitdb };
}
