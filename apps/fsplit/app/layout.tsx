import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

import { getServerSession } from "next-auth";
import NextTopLoader from "nextjs-toploader";

import { authOptions } from "~/lib/auth";
import { cn } from "@fondingo/ui/utils";

import SessionProvider from "~/components/providers/session-provider";
import { mergeUserAccounts } from "~/utils/merge-user-account";
import { Providers } from "~/components/providers";
import { Toaster } from "@fondingo/ui/toaster";

const font = Roboto({
  // weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

const APP_NAME = "FSplit";
const APP_DEFAULT_TITLE = "FSplit";
const APP_TITLE_TEMPLATE = "%s - FSplit";
const APP_DESCRIPTION = "Your favorite expenses app";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    startupImage: ["images/logo.png"],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F4F4",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

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
