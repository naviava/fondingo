"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { uuid } from "@fondingo/utils/uuid";
import Link from "next/link";

import { MdOutlineLocalActivity, MdLocalActivity } from "react-icons/md";
import { NavbarOption } from "./navbar-option";
import { Button } from "@fondingo/ui/button";
import {
  RiUser3Line,
  RiUser3Fill,
  RiGroupFill,
  RiGroupLine,
} from "react-icons/ri";

export function Navbar() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  // TODO: Add global state for navbar links.
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

  const handleClick = useCallback(() => {
    if (!!params.groupId) {
      return router.push(`/groups/${params.groupId}/expense`);
    }
    return null;
  }, [params.groupId, router]);

  return (
    <nav className="absolute bottom-6 z-50 flex h-14 w-full items-center justify-between border-t bg-[#F4F4F4] px-4 pt-2 md:px-6">
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
        onClick={handleClick}
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
