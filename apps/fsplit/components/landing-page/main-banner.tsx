import Image from "next/image";

interface IProps {}

export function MainBanner({}: IProps) {
  return (
    <div className="flex flex-col items-center md:flex-row">
      <div className="relative aspect-square w-full flex-1">
        <Image
          fill
          src="/images/wide-phone-banner.png"
          alt="Welcome to FSplit"
          className="object-cover"
        />
      </div>
      <div className=" flex-1">A</div>
    </div>
  );
}
