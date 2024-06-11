"use client";

import { useRouter } from "next/navigation";
import { Option } from "./option";

export function Feedback() {
  const router = useRouter();

  return (
    <div>
      <h3 className="mb-2 px-4 font-medium md:px-8">Feedback</h3>
      <Option label="Contact us" onClick={() => router.push("/contact")} />
      <Option label="Visit website" onClick={() => router.push("/")} />
    </div>
  );
}
