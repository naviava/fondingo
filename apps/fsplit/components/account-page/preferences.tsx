"use client";

import { useChangePasswordModal } from "@fondingo/store/use-change-password-modal";
import { useChangeCurrencyModal } from "@fondingo/store/fsplit";
import { useAnimation } from "~/hooks/use-animation";
import { useSession } from "next-auth/react";

import { TCurrencyCode } from "@fondingo/db-split";
import { Option } from "./option";

interface IProps {
  preferredCurrency: TCurrencyCode;
}

export function Preferences({ preferredCurrency }: IProps) {
  const { data: session } = useSession();
  const { scope, animationText, scaleAndShake, textStory } = useAnimation();

  const { onOpen: openChangePasswordModal } = useChangePasswordModal(
    (state) => state,
  );
  const { onOpen: openChangeCurrencyModal } = useChangeCurrencyModal(
    (state) => state,
  );

  const handleChangePassword = async () => {
    if (session?.user.isOAuth) {
      await scaleAndShake();
      return await textStory([
        "Change password",
        "You are using a social account",
        "You cannot change your password on FSplit",
      ]);
    }
    openChangePasswordModal();
  };

  return (
    <section>
      <h3 className="mb-2 px-4 font-medium md:px-8">Preferences</h3>
      <Option
        ref={scope}
        label={animationText || "Change password"}
        onClick={handleChangePassword}
      />
      <Option
        label="Change preferred currency"
        onClick={() => openChangeCurrencyModal(preferredCurrency)}
      />
    </section>
  );
}
