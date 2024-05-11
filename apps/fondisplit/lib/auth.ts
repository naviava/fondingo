import { compare } from "bcrypt";
import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { Adapter } from "next-auth/adapters";
import splitdb from "@fondingo/db-split";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(splitdb) as Adapter,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
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
};
