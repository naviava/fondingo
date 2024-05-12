import { Button } from "@fondingo/ui/button";
import { Activity, Plus, User, Users } from "@fondingo/ui/lucide";
import { v4 as uuid } from "@fondingo/utils/uuid";

const optionsLeft = [
  { id: uuid(), Icon: User, label: "Friends", href: "/friends" },
  { id: uuid(), Icon: Users, label: "Groups", href: "/groups" },
];

const optionsRight = [
  { id: uuid(), Icon: Activity, label: "Activity", href: "/activity" },
  { id: uuid(), Icon: User, label: "Account", href: "/account" },
];

export function Navbar() {
  return (
    <section className="flex h-14 items-center justify-between px-2">
      {optionsLeft.map((option) => (
        <div key={option.id} className="flex flex-col items-center gap-y-1">
          <option.Icon className="h-6 w-6" />
          <span>{option.label}</span>
        </div>
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
          <span>{option.label}</span>
        </div>
      ))}
    </section>
  );
}
