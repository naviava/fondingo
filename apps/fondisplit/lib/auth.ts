import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { AuthOptions } from "next-auth";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";

import { sign } from "@fondingo/utils/jwt";
import splitdb from "@fondingo/db-split";
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
          where: { email: credentials.email, disabled: false },
        });
        if (!user || !user?.hashedPassword)
          throw new Error("Invalid credentials");
        const isCorrectPassword = await compare(
          credentials.password,
          user.hashedPassword,
        );
        if (!isCorrectPassword) throw new Error("Invalid credentials");
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (!!account) {
        const tokenObject = {
          id: user.id,
          email: user.email,
        };
        token.accessToken = sign(tokenObject, process.env.NEXTAUTH_SECRET!);
      }
      if (!!user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return { ...token };
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
};
