"use client";

import { useMemo } from "react";

import { Preferences } from "~/components/account-page/preferences";
import { Feedback } from "~/components/account-page/feedback";
import { Logout } from "~/components/account-page/logout";
import { ScrollArea } from "@fondingo/ui/scroll-area";

import { usePanelHeight } from "@fondingo/store/use-panel-height";
import { useMediaQuery } from "@fondingo/utils/hooks";

export function OptionsArea() {
  const { panelHeight } = usePanelHeight((state) => state);

  const height = useMemo(
    () => (!!panelHeight ? `${panelHeight - 0}px` : "default"),
    [panelHeight],
  );

  return (
    <ScrollArea style={{ height }}>
      <div className="mt-10 space-y-8">
        <Preferences />
        <Feedback />
      </div>
      <Logout />
    </ScrollArea>
  );
}
