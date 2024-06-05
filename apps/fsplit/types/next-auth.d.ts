import { TUserRole } from "@fondingo/db-split";
import { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role: TUserRole;
  isOAuth: boolean;
  disabled: boolean;
  isVerified: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
