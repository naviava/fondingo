import { SocialHeader } from "~/components/social-header";
import { ScrollArea } from "@fondingo/ui/scroll-area";

export default function FriendsPage() {
  return (
    // TODO: Add UI when there are no friends
    <>
      <SocialHeader />
      <ScrollArea className="h-[80vh] md:h-[82vh] lg:h-[79vh]"></ScrollArea>
    </>
  );
}
