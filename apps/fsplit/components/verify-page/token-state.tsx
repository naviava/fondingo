import Image from "next/image";

import { ActionButtons } from "./action-buttons";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";
import { LandingLayoutWrapper } from "../landing-layout-wrapper";

interface IProps {
  title?: string;
  isError?: boolean;
  isExpired?: boolean;
  isInvalid?: boolean;
}

export function TokenState({
  isError,
  isExpired,
  isInvalid,
  title = "Verify your email",
}: IProps) {
  return (
    <LandingLayoutWrapper>
      <div className="flex h-full flex-col items-center justify-center space-y-6 pb-24">
        <h1
          className={cn(
            "px-4 text-3xl font-medium tracking-wide md:text-4xl",
            hfont.className,
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "text-balance px-4 text-center text-sm font-medium tracking-wide md:text-base",
            hfont.className,
          )}
        >
          You will need to verify your email to complete registration
        </p>
        <Image
          src="images/mail-sent.svg"
          alt="No groups yet"
          height={400}
          width={400}
          className="object-cover"
        />
        <p className="text-balance px-2 text-center text-sm tracking-wide text-neutral-500 md:text-base">
          {isExpired && (
            <span>
              That token has expired. Please click on the "Resend Email" button
              below to generate a new confirmation token for your account.
            </span>
          )}
          {isInvalid && (
            <span>
              That token is invalid! Please check your email inbox for a message
              from FSplit. Click on the link in the email to verify your
              account.
            </span>
          )}
          {isError && (
            <span>
              An unexpected error occurred. Please try again later or contact
              support.
            </span>
          )}
          {!isExpired && !isInvalid && (
            <span>
              An email has been sent to your registered email with a link to
              verify your account. If you have not received the email after a
              few minutes, please check your spam folder.
            </span>
          )}
        </p>
        <ActionButtons isInvalid={isInvalid} />
      </div>
    </LandingLayoutWrapper>
  );
}
