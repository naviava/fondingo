"use client";

import { memo, useMemo } from "react";

import { useAddMemberModal } from "@fondingo/store/fsplit";
import { usePanel } from "@fondingo/ui/use-panel";
import { linearGradientWithAlpha } from "~/utils";

import { DynamicScrollArea } from "@fondingo/ui/dynamic-scroll-area";
import { UserPlus } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";

interface IProps {
  children: React.ReactNode;
  userId?: string;
  groupId: string;
  groupColor: string;
  hasMembers: boolean;
  hasExpenses: boolean;
  hasPayments: boolean;
  isGroupManager: boolean;
}
export const GroupExpensesPanel = memo(_GroupExpensesPanel);
function _GroupExpensesPanel({
  children,
  userId = "",
  groupId,
  groupColor,
  hasMembers,
  hasExpenses,
  hasPayments,
}: IProps) {
  const { onOpen } = useAddMemberModal();

  if (!hasMembers) {
    return (
      <Wrapper>
        <div className="flex -translate-y-1/2 flex-col items-center justify-center">
          <h2 className="mb-10 text-center text-gray-500">
            You're the only one here!
          </h2>
          <Button
            type="button"
            variant="cta"
            onClick={() => onOpen({ userId, groupId })}
            className="h-14 w-64 text-lg shadow-md shadow-neutral-500"
          >
            <UserPlus className="mr-2" size={24} />
            Add members
          </Button>
        </div>
      </Wrapper>
    );
  }

  if (hasMembers && !hasExpenses && !hasPayments) {
    return (
      <Wrapper>
        <h2 className="mb-2 text-center font-semibold tracking-wide">
          No expenses here yet.
        </h2>
        <p>Tap the plus button below to add an expense with this group.</p>
        <div
          className="mt-10 h-16 w-4"
          style={{
            backgroundImage: linearGradientWithAlpha(groupColor, 0.5),
          }}
        />
        <div
          style={{
            width: 0,
            height: 0,
            borderRight: "30px solid transparent",
            borderTop: `20px solid ${groupColor}`,
            borderLeft: "30px solid transparent",
          }}
        />
      </Wrapper>
    );
  }

  return <DynamicScrollArea>{children}</DynamicScrollArea>;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[55vh] flex-col items-center justify-center px-4 text-center md:h-[58vh] lg:h-[68vh] xl:h-[67vh]">
      {children}
    </div>
  );
}
