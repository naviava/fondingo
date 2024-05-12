import { SearchBar } from "~/components/search-bar";

export default function GroupsPage() {
  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4">
        <SearchBar />
        <div className="font-semibold">Create group</div>
      </div>
      <div className="my-6 px-4">Overall you are owed $12916.39</div>
      <div className="flex-1 px-4 pb-24">Main panel</div>
    </>
  );
}
