import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

import SessionProvider from "~/providers/session-provider";
import { cn } from "@fondingo/ui/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sign in - Fondingo Services",
  description: "Single authentication service for all Fondingo services",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={cn(inter.className, "flex flex-grow")}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
