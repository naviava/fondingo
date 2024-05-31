"use client";

import { Button } from "@fondingo/ui/button";
import { signIn } from "next-auth/react";
import { IconType } from "react-icons";

interface IProps {
  icon: IconType;
  authTag: string;
  fill?: string;
}

export function SocialAuthButton({ authTag, fill, icon: Icon }: IProps) {
  return (
    <Button
      onClick={() => signIn(authTag)}
      className="text-default h-auto rounded-full bg-white/50 p-3 hover:bg-white"
    >
      <Icon className="h-6 w-6" fill={fill} />
    </Button>
  );
}
