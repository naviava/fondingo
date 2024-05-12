import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import NextTopLoader from "nextjs-toploader";
import { getServerSession } from "next-auth";

import { cn } from "@fondingo/ui/utils";
import { authOptions } from "~/lib/auth";

import { Providers } from "~/components/providers";
import SessionProvider from "~/components/providers/session-provider";
import { Toaster } from "@fondingo/ui/toaster";

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
      <body className={cn("text-neutral-700 antialiased", font.className)}>
        <NextTopLoader color="#11998E" showSpinner={false} height={5} />
        <SessionProvider session={session}>
          <Providers>
            <main className="h-full bg-black/20">{children}</main>
            <Toaster />
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
