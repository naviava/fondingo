import Image from "next/image";

export default function ActivityPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
    </div>
  );
}
