import { useSettleUpDrawer } from "@fondingo/store/fondisplit";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@fondingo/ui/drawer";

export function SettlementDrawer() {
  const { isDrawerOpen, onDrawerClose, members, drawerTitle } =
    useSettleUpDrawer();

  return (
    <Drawer open={isDrawerOpen} onOpenChange={onDrawerClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
