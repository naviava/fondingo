"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@fondingo/ui/button";
import { Activity, Plus, User, Users } from "@fondingo/ui/lucide";

import { v4 as uuid } from "@fondingo/utils/uuid";
import {
  RiUser3Line,
  RiUser3Fill,
  RiGroupFill,
  RiGroupLine,
} from "react-icons/ri";
import { useMemo } from "react";

export function Navbar() {
  const pathname = usePathname();

  const optionsLeft = useMemo(
    () => [
      {
        id: uuid(),
        InactiveIcon: RiUser3Line,
        ActiveIcon: RiUser3Fill,
        label: "Friends",
        href: "/friends",
        isActive: pathname === "/friends",
      },
      {
        id: uuid(),
        InactiveIcon: RiGroupLine,
        ActiveIcon: RiGroupFill,
        label: "Groups",
        href: "/groups",
        isActive: pathname === "/groups",
      },
    ],
    [],
  );

  const optionsRight = useMemo(
    () => [
      {
        id: uuid(),
        Icon: Activity,
        label: "Activity",
        href: "/activity",
        isActive: pathname === "/activity",
      },
      {
        id: uuid(),
        Icon: User,
        label: "Account",
        href: "/account",
        isActive: pathname === "/account",
      },
    ],
    [],
  );

  return (
    <nav className="absolute bottom-6 flex h-14 w-full items-center justify-between border-t px-4 pt-2 md:px-6">
      {optionsLeft.map((option) => (
        <Link key={option.id} href={option.href}>
          <div key={option.id} className="flex flex-col items-center gap-y-1">
            {option.isActive ? (
              <option.ActiveIcon className="h-6 w-6" />
            ) : (
              <option.InactiveIcon className="h-6 w-6" />
            )}
            <span className="text-sm md:text-base">{option.label}</span>
          </div>
        </Link>
      ))}
      <Button className="aspect-square h-full px-3 text-4xl">
        <Plus className="h-12 w-12" />
      </Button>
      {optionsRight.map((option) => (
        <div key={option.id} className="flex flex-col items-center gap-y-1">
          {option.label === "Activity" ? (
            <option.Icon className="h-6 w-6" />
          ) : (
            // TODO: Replace with user avatar
            <User className="h-6 w-6" />
          )}
          <span className="text-sm md:text-base">{option.label}</span>
        </div>
      ))}
    </nav>
  );
}
