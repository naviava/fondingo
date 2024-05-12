import { Navbar } from "~/components/navbar";
import { SearchBar } from "~/components/search-bar";

export default function GroupsPage() {
  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col bg-[#F4F4F4] p-4">
      <div className="flex items-center justify-between">
        {/* TODO: Add click handler */}
        <SearchBar />
        <div className="font-bold">Create group</div>
      </div>
      <div className="my-6">Overall you are owed $12916.39</div>
      <div className="flex-1">Main panel</div>
      <Navbar />
    </div>
  );
}
