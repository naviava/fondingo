import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import TwitterProvider from "next-auth/providers/twitter";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";
import { AuthOptions } from "next-auth";

import { mergeUserAccountById } from "~/utils/merge-user-account-by-id";
import splitdb, { TUserRole } from "@fondingo/db-split";
import { compare } from "bcrypt";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(splitdb) as Adapter,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID ?? "",
      clientSecret: process.env.AUTH_DISCORD_SECRET ?? "",
    }),
    TwitterProvider({
      clientId: process.env.AUTH_TWITTER_ID ?? "",
      clientSecret: process.env.AUTH_TWITTER_SECRET ?? "",
    }),
    TwitterProvider({
      clientId: process.env.AUTH_FACEBOOK_ID ?? "",
      clientSecret: process.env.AUTH_FACEBOOK_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Invalid credentials");
        const user = await splitdb.user.findUnique({
          where: { email: credentials.email.toLowerCase(), disabled: false },
        });
        if (!user || !user?.hashedPassword)
          throw new Error("Invalid credentials");
        const isCorrectPassword = await compare(
          credentials.password,
          user.hashedPassword,
        );
        if (!isCorrectPassword) throw new Error("Invalid credentials");
        if (!user.isMerged) await mergeUserAccountById(user.id);
        return user;
      },
    }),
  ],
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
      if (!!token.role && !!session.user) {
        session.user.role = token.role as TUserRole;
      }
      if (!!token.image && !!session.user) {
        session.user.image = token.image as string;
      }
      if (!!session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.disabled = token.disabled as boolean;
      }
      return session;
    },
    jwt: async ({ token }) => {
      if (!token.sub) return token;
      const existingUser = await splitdb.user.findUnique({
        where: { id: token.sub },
      });
      if (!existingUser) return token;
      const existingAccount = await splitdb.account.findFirst({
        where: { id: existingUser.id },
      });

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;
      token.role = existingUser.role;
      token.isOAuth = !!existingAccount;
      token.disabled = existingUser.disabled;
      return token;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
