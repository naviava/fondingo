"use client";

import { useChangePasswordModal } from "@fondingo/store/use-change-password-modal";
import { useChangeCurrencyModal } from "@fondingo/store/fsplit";
import { CurrencyCode } from "@fondingo/db-split";
import { Option } from "./option";

interface IProps {
  preferredCurrency: CurrencyCode;
}

export function Preferences({ preferredCurrency }: IProps) {
  const { onOpen: openChangePasswordModal } = useChangePasswordModal(
    (state) => state,
  );
  const { onOpen: openChangeCurrencyModal } = useChangeCurrencyModal(
    (state) => state,
  );

  return (
    <section>
      <h3 className="mb-2 px-4 font-medium md:px-8">Preferences</h3>
      <Option label="Change password" onClick={openChangePasswordModal} />
      <Option
        label="Change preferred currency"
        onClick={() => openChangeCurrencyModal(preferredCurrency)}
      />
    </section>
  );
}
