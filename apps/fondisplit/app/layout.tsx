import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { cn } from "@fondingo/ui/utils";

const font = Inter({ subsets: ["latin"] });

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
      <body
        className={cn("bg-slate-900 text-white antialiased", font.className)}
      >
        {children}
      </body>
    </html>
  );
}
