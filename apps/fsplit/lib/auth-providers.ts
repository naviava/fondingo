import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import TwitterProvider from "next-auth/providers/twitter";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

import { mergeUserAccountById } from "~/utils/merge-user-account-by-id";
import splitdb from "@fondingo/db-split";
import { compare } from "bcrypt";

export const providers = [
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
    authorize: async (credentials) => {
      if (!credentials?.email || !credentials?.password)
        throw new Error("Invalid credentials");
      const user = await splitdb.user.findUnique({
        where: {
          email: credentials.email.toLowerCase(),
          disabled: false,
        },
        include: { accountVerification: true },
      });
      if (!user || !user?.hashedPassword)
        throw new Error("Invalid credentials");
      const isCorrectPassword = await compare(
        credentials.password,
        user.hashedPassword,
      );
      if (!isCorrectPassword) throw new Error("Invalid credentials");
      if (!user.accountVerification) throw new Error("Email not verified");
      if (!user.isMerged) await mergeUserAccountById(user.id);
      return user;
    },
  }),
];
