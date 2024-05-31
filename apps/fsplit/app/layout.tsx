import { Roboto } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

import { getServerSession } from "next-auth";
import NextTopLoader from "nextjs-toploader";

import { authOptions } from "~/lib/auth";
import { cn } from "@fondingo/ui/utils";

import SessionProvider from "~/components/providers/session-provider";
import { mergeUserAccounts } from "~/lib/merge-user-account";
import { Providers } from "~/components/providers";
import { Toaster } from "@fondingo/ui/toaster";

const font = Roboto({
  // weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FSplit",
  description: "Your favorite expenses app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!!session && !!session.user && !!session.user.email)
    await mergeUserAccounts();

  return (
    <html lang="en">
      <body
        className={cn("h-dvh text-neutral-700 antialiased", font.className)}
      >
        <NextTopLoader color="#11998E" showSpinner={false} height={5} />
        <SessionProvider session={session}>
          <Providers>
            <main className="h-dvh bg-black/20">{children}</main>
            <Toaster />
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
