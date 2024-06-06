import Image from "next/image";
interface IProps {
  isSearching: boolean;
}

export function EmptyState({ isSearching }: IProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4">
      {isSearching ? (
        <p className="text-sm italic text-neutral-400">
          No results. Try searching for something else...
        </p>
      ) : (
        <>
          <Image
            src="images/search-illustration.svg"
            alt="Search"
            width={200}
            height={200}
            className="object-cover"
          />
          <p className="text-xs text-neutral-400 md:text-sm">
            Start searching by typing something
          </p>
        </>
      )}
    </div>
  );
}
