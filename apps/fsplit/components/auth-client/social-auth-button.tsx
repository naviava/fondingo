"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { signIn } from "next-auth/react";

import { Loader2 } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { IconType } from "react-icons";

interface IProps {
  icon: IconType;
  authTag: string;
  fill?: string;
  disabled: boolean;
  setDisabled: Dispatch<SetStateAction<boolean>>;
}

export function SocialAuthButton({
  authTag,
  fill,
  disabled,
  setDisabled,
  icon: Icon,
}: IProps) {
  const [clicked, setClicked] = useState(false);

  return (
    <Button
      disabled={disabled}
      onClick={async () => {
        setClicked(true);
        setDisabled(true);
        await signIn(authTag);
      }}
      className="text-default h-auto rounded-full bg-white/50 p-3 hover:bg-white"
    >
      {clicked ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <Icon className="h-6 w-6" fill={fill} />
      )}
    </Button>
  );
}
