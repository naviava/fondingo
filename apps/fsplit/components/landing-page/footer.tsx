import Link from "next/link";

import { uuid } from "@fondingo/utils/uuid";
import { cn } from "@fondingo/ui/utils";
import { archivo } from "~/utils";
import { Button } from "@fondingo/ui/button";
import { Logo } from "~/components/logo";

const COLUMNS = [
  {
    id: uuid(),
    title: "Legal",
    links: [
      { id: uuid(), text: "Privacy Policy", href: "#" },
      { id: uuid(), text: "Terms of Service", href: "#" },
    ],
  },
  {
    id: uuid(),
    title: "Support",
    links: [
      { id: uuid(), text: "Help", href: "#" },
      { id: uuid(), text: "Account", href: "#" },
      { id: uuid(), text: "Reset Password", href: "#" },
      { id: uuid(), text: "Email Verification", href: "#" },
    ],
  },
  {
    id: uuid(),
    title: "Social",
    links: [
      { id: uuid(), text: "GitHub", href: "#" },
      { id: uuid(), text: "Instagram", href: "#" },
      { id: uuid(), text: "Twitter", href: "#" },
      { id: uuid(), text: "Facebook", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <div
      className={cn(
        "bg-slate-700 pb-16 pt-10 text-neutral-300",
        archivo.className,
      )}
    >
      <div className="mx-auto grid w-[20rem] max-w-screen-lg grid-cols-1 gap-x-6 gap-y-14 px-10 md:w-auto md:grid-cols-4">
        <Logo dark variant="tall" />
        {COLUMNS.map((column) => (
          <FooterColumn key={column.title} {...column} />
        ))}
      </div>
      <p className="mt-16 text-center text-xs text-neutral-400 lg:text-sm">
        © 2024 Navin Avadhani. All rights reserved.
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
      <h3 className="text-neutral-40 mb-6 text-center font-bold md:text-left">
        {title}
      </h3>
      <ul className="">
        {links.map((link) => (
          <li key={link.href} className="mx-auto w-fit md:w-full">
            <Button
              asChild
              size="sm"
              variant="link"
              className="text-sm text-white md:pl-0"
            >
              <Link href={link.href}>{link.text}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
