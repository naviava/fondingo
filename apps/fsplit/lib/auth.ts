import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";
import { AuthOptions } from "next-auth";

import { mergeUserAccountById } from "~/utils/merge-user-account-by-id";
import splitdb, { TUserRole } from "@fondingo/db-split";
import { providers } from "./auth-providers";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(splitdb) as Adapter,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  events: {
    linkAccount: async ({ user }) => {
      await mergeUserAccountById(user.id);
    },
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (!!token.sub && !!session.user) {
        session.user.id = token.sub;
      }
      if (!!session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image as string;
        session.user.role = token.role as TUserRole;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.disabled = token.disabled as boolean;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
    jwt: async ({ token }) => {
      if (!token.sub) return token;
      const existingUser = await splitdb.user.findUnique({
        where: { id: token.sub },
        include: {
          accounts: true,
          accountVerification: true,
          confirmEmailToken: true,
        },
      });
      if (!existingUser) return token;

      const isOAuth = !!existingUser.accounts.length;

      let isVerified = !!existingUser.accountVerification;
      if (isOAuth && !isVerified) {
        isVerified = !!(await splitdb.accountVerification.create({
          data: { userId: existingUser.id },
        }));
      }

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;
      token.role = existingUser.role;
      token.disabled = existingUser.disabled;
      token.isOAuth = isOAuth;
      token.isVerified = isVerified;
      return token;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
