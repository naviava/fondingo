"use client";

import { useChangePasswordModal } from "@fondingo/store/use-change-password-modal";
import { Option } from "./option";

export function Preferences() {
  const { onOpen } = useChangePasswordModal((state) => state);

  return (
    <section>
      <h3 className="mb-2 px-4 font-medium md:px-8">Preferences</h3>
      <Option label="Change password" onClick={onOpen} />
      <Option label="Change preferred currency" />
    </section>
  );
}
