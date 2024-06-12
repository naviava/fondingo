import Link from "next/link";

import { ExternalLink } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { Logo } from "~/components/logo";

import { uuid } from "@fondingo/utils/uuid";
import { cn } from "@fondingo/ui/utils";
import { archivo } from "~/utils";
import { FooterLink } from "./footer-link";

const COLUMNS = [
  {
    id: uuid(),
    title: "Support",
    links: [
      { id: uuid(), text: "Account", href: "/account" },
      { id: uuid(), text: "Contact us", href: "/contact" },
      { id: uuid(), text: "Reset Password", href: "/forgot-password" },
      { id: uuid(), text: "Email Verification", href: "/verification" },
    ],
  },
  {
    id: uuid(),
    title: "Legal",
    links: [
      { id: uuid(), text: "Privacy Policy", href: "/privacy-policy" },
      { id: uuid(), text: "Terms of Service", href: "/terms" },
    ],
  },
  {
    id: uuid(),
    title: "Social",
    links: [
      { id: uuid(), text: "GitHub", href: "https://github.com/naviava" },
      {
        id: uuid(),
        text: "LinkedIn",
        href: "https://www.linkedin.com/in/navin-avadhani-aa288785/",
      },
      { id: uuid(), text: "X (Twitter)", href: "https://x.com/oldmannav" },
    ],
  },
];

export function Footer() {
  return (
    <div
      className={cn(
        "bg-slate-700 pb-10 pt-10 text-neutral-300",
        archivo.className,
      )}
    >
      <div className="mx-auto grid w-[20rem] max-w-screen-lg grid-cols-1 gap-x-6 gap-y-14 px-10 md:w-auto md:grid-cols-4">
        <Link href="/" className="mx-auto h-fit w-fit md:mx-0">
          <Logo dark variant="tall" />
        </Link>
        {COLUMNS.map((column) => (
          <FooterColumn key={column.title} {...column} />
        ))}
      </div>
      <p className="mt-16 text-center text-xs text-neutral-300 lg:text-sm">
        © 2024 Fondingo. All rights reserved.
      </p>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { id: string; text: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-center font-bold text-neutral-400 md:mb-8 md:text-left lg:text-lg">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <FooterLink key={link.id} title={title} {...link} />
        ))}
      </ul>
    </div>
  );
}
