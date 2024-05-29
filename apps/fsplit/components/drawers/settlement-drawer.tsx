import { GroupMemberClient } from "~/types";
import { cn } from "@fondingo/ui/utils";
import { useCallback } from "react";

import { useSettlementDrawer } from "@fondingo/store/fondisplit";
import { ScrollArea } from "@fondingo/ui/scroll-area";
import { Separator } from "@fondingo/ui/separator";
import { Avatar } from "@fondingo/ui/avatar";
import { Check } from "@fondingo/ui/lucide";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@fondingo/ui/drawer";

export function SettlementDrawer() {
  const {
    drawerType,
    isDrawerOpen,
    onDrawerClose,
    members,
    drawerTitle,
    selectedDebtor,
    selectedCreditor,
    setSelectedDebtor,
    setSelectedCreditor,
  } = useSettlementDrawer();

  const handleSelection = useCallback(
    (member: GroupMemberClient) => {
      if (drawerType === "debtor") {
        setSelectedDebtor(member);
      } else {
        setSelectedCreditor(member);
      }
      onDrawerClose();
    },
    [drawerType, setSelectedDebtor, setSelectedCreditor, onDrawerClose],
  );

  return (
    <Drawer open={isDrawerOpen} onOpenChange={onDrawerClose}>
      <DrawerContent className="mx-auto max-w-xl">
        <DrawerHeader className="px-0 py-1 text-center">
          <DrawerTitle className="py-2 text-center">{drawerTitle}</DrawerTitle>
        </DrawerHeader>
        <Separator />
        <ScrollArea
          className={cn(!!members && members.length > 5 && "h-[40vh]")}
        >
          <ul className="px-4">
            {members.map((member) => (
              <li key={member.id}>
                <div
                  role="button"
                  onClick={() => handleSelection(member)}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-x-4">
                    <Avatar
                      userName={member.name}
                      userImageUrl={member.image || ""}
                    />
                    <p>{member.name}</p>
                  </div>
                  {drawerType === "debtor" &&
                    member.id === selectedDebtor?.id && (
                      <div className="bg-cta rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  {drawerType === "creditor" &&
                    member.id === selectedCreditor?.id && (
                      <div className="bg-cta rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                </div>
                <Separator />
              </li>
            ))}
          </ul>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
