import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { getServerSession } from "next-auth";
import SessionProvider from "~/components/providers/session-provider";

import { cn } from "@fondingo/ui/utils";
import { authOptions } from "~/lib/auth";

const font = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fondisplit",
  description: "Your favorite expenses app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={cn("antialiased", font.className)}>
        <SessionProvider session={session}>
          <main className="h-full bg-black/20">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
