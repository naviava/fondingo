import { SearchBar } from "~/components/search-bar";

export default function GroupsPage() {
  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4">
        {/* TODO: Add click handler */}
        <SearchBar />
        <div className="font-bold">Create group</div>
      </div>
      <div className="my-6 px-4">Overall you are owed $12916.39</div>
      <div className="px-4">Main panel</div>
    </>
  );
}
