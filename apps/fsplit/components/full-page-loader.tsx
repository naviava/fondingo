"use client";

import { FallingLines } from "@fondingo/ui/loaders";

export default function FullPageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <FallingLines color="#11998E" width="100" visible={true} />
    </div>
  );
}
