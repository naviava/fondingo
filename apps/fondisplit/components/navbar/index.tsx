"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@fondingo/ui/button";
import { uuid } from "@fondingo/utils/uuid";

import {
  RiUser3Line,
  RiUser3Fill,
  RiGroupFill,
  RiGroupLine,
} from "react-icons/ri";
import { MdOutlineLocalActivity, MdLocalActivity } from "react-icons/md";

import { NavbarOption } from "./navbar-option";

export function Navbar() {
  const pathname = usePathname();

  const optionsLeft = useMemo(
    () => [
      {
        id: uuid(),
        inactiveIcon: RiUser3Line,
        activeIcon: RiUser3Fill,
        label: "Friends",
        href: "/friends",
        isActive: pathname.startsWith("/friends"),
      },
      {
        id: uuid(),
        inactiveIcon: RiGroupLine,
        activeIcon: RiGroupFill,
        label: "Groups",
        href: "/groups",
        isActive: pathname.startsWith("/groups"),
      },
    ],
    [pathname],
  );

  const optionsRight = useMemo(
    () => [
      {
        id: uuid(),
        inactiveIcon: MdOutlineLocalActivity,
        activeIcon: MdLocalActivity,
        label: "Activity",
        href: "/activity",
        isActive: pathname.startsWith("/activity"),
      },
      {
        id: uuid(),
        inactiveIcon: RiUser3Line,
        activeIcon: RiUser3Fill,
        label: "Account",
        href: "/account",
        isActive: pathname.startsWith("/account"),
      },
    ],
    [pathname],
  );

  return (
    <nav className="absolute bottom-6 flex h-14 w-full items-center justify-between border-t px-4 pt-2 md:px-6">
      {optionsLeft.map((option) => (
        <Link key={option.id} href={option.href}>
          <NavbarOption
            label={option.label}
            isActive={option.isActive}
            activeIcon={option.activeIcon}
            inactiveIcon={option.inactiveIcon}
          />
        </Link>
      ))}
      <Button
        type="button"
        variant="splitCta"
        className="aspect-square h-full px-3"
      >
        <span className="text-[60px] font-light">+</span>
      </Button>
      {optionsRight.map((option) => (
        <Link key={option.id} href={option.href}>
          <NavbarOption
            label={option.label}
            isActive={option.isActive}
            activeIcon={option.activeIcon}
            inactiveIcon={option.inactiveIcon}
          />
        </Link>
      ))}
    </nav>
  );
}
