import Link from "next/link";

import { ExternalLink } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { Logo } from "~/components/logo";

import { uuid } from "@fondingo/utils/uuid";
import { cn } from "@fondingo/ui/utils";
import { archivo } from "~/utils";

const COLUMNS = [
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
    title: "Support",
    links: [
      { id: uuid(), text: "Help", href: "#" },
      { id: uuid(), text: "Account", href: "#" },
      { id: uuid(), text: "Reset Password", href: "/forgot-password" },
      { id: uuid(), text: "Email Verification", href: "#" },
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
        <Logo dark variant="tall" />
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
          <li key={link.href} className="mx-auto w-fit md:w-full">
            <Button
              asChild
              size="sm"
              variant="link"
              className="text-sm text-white md:pl-0 lg:text-base"
            >
              <Link
                href={link.href}
                target={title === "Social" ? "_blank" : undefined}
              >
                {link.text}
                {title === "Social" && (
                  <ExternalLink className="ml-2 h-4 w-4 text-neutral-400" />
                )}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
