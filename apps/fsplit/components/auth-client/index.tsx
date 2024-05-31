"use client";

import { useAuthForm } from "@fondingo/store/use-auth-form";
import { uuid } from "@fondingo/utils/uuid";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";

import { RiTwitterXFill } from "react-icons/ri";
import { FaFacebook } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa6";
import { SiGithub } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";

import { SocialAuthButton } from "./social-auth-button";
import { RegisterForm } from "./register-form";
import { Button } from "@fondingo/ui/button";
import { SigninForm } from "./signin-form";

const OPTIONS = [
  {
    id: uuid(),
    icon: FaFacebook,
    authTag: "facebook",
    fill: "#1877f2",
  },
  {
    id: uuid(),
    icon: SiGithub,
    authTag: "github",
    fill: "#333",
  },
  {
    id: uuid(),
    icon: RiTwitterXFill,
    authTag: "twitter",
    fill: "#000",
  },
  {
    id: uuid(),
    icon: FaDiscord,
    authTag: "discord",
    fill: "#7289da",
  },
  {
    id: uuid(),
    icon: FcGoogle,
    authTag: "google",
  },
];

export function AuthClient() {
  const { formType, toggleType } = useAuthForm();

  return (
    <div className="z-[2] flex w-full max-w-[30rem] flex-col items-center rounded-[2rem] bg-black/10 p-8 backdrop-blur-md">
      {formType === "signin" && <SigninForm />}
      {formType === "register" && <RegisterForm />}
      <div className="mt-8 text-center">
        {formType === "signin" && (
          <>
            <span className={cn("text-sm font-medium", hfont.className)}>
              Or sign in with
            </span>
            <div className="mt-4 flex items-center justify-center gap-x-4">
              {OPTIONS.map((option) => (
                <SocialAuthButton key={option.id} {...option} />
              ))}
            </div>
          </>
        )}
        <div
          className={cn(
            "-mt-2 flex items-center justify-center",
            formType === "signin" && "mt-6",
          )}
        >
          <span className="text-sm">
            {formType === "signin"
              ? "Are you new?"
              : "Already have an account?"}
          </span>
          <Button size="sm" variant="link" onClick={toggleType}>
            {formType === "signin" ? "Create an account" : "Login"}
          </Button>
        </div>
      </div>
    </div>
  );
}
