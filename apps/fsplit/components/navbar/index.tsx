"use client";

import { Fragment } from "react";
import Link from "next/link";

import { usePanel } from "@fondingo/ui/use-panel";
import { uuid } from "@fondingo/utils/uuid";

import { MdOutlineLocalActivity, MdLocalActivity } from "react-icons/md";
import { NavbarOption } from "./navbar-option";
import { AnimatedPlus } from "./animated-plus";
import {
  RiUser3Line,
  RiUser3Fill,
  RiGroupFill,
  RiGroupLine,
} from "react-icons/ri";

const OPTIONS = [
  {
    id: uuid(),
    inactiveIcon: RiUser3Line,
    activeIcon: RiUser3Fill,
    label: "Friends",
    href: "/friends",
  },
  {
    id: uuid(),
    inactiveIcon: RiGroupLine,
    activeIcon: RiGroupFill,
    label: "Groups",
    href: "/groups",
  },
  {
    id: uuid(),
    inactiveIcon: MdOutlineLocalActivity,
    activeIcon: MdLocalActivity,
    label: "Activity",
    href: "/activity",
  },
  {
    id: uuid(),
    inactiveIcon: RiUser3Line,
    activeIcon: RiUser3Fill,
    label: "Account",
    href: "/account",
  },
];

export function Navbar() {
  const { bottomDivRef } = usePanel();

  return (
    <nav
      ref={bottomDivRef}
      className="absolute bottom-0 z-50 flex h-20 w-full items-center justify-between border-t bg-[#F4F4F4] px-4 pb-6 pt-2 md:px-6"
    >
      {OPTIONS.map((option, idx) => (
        <Fragment key={option.id}>
          {idx === 2 && <AnimatedPlus />}
          <Link href={option.href}>
            <NavbarOption
              href={option.href}
              label={option.label}
              activeIcon={option.activeIcon}
              inactiveIcon={option.inactiveIcon}
              showNotification={option.label === "Friends"}
            />
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}
