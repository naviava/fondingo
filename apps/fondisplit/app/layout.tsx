import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { cn } from "@fondingo/ui/utils";

const font = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fondisplit",
  description: "Your favorite expenses app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={cn("antialiased", font.className)}>
        <main className="h-full bg-black/20">{children}</main>
      </body>
    </html>
  );
}
