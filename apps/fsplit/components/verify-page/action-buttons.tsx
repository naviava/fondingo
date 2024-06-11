"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { differenceInSeconds } from "@fondingo/utils/date-fns";
import { toast } from "@fondingo/ui/use-toast";
import { trpc } from "~/lib/trpc/client";

import { Button } from "@fondingo/ui/button";
import { Loader } from "@fondingo/ui/lucide";
import Link from "next/link";

interface IProps {
  isInvalid?: boolean;
}

export function ActionButtons({ isInvalid }: IProps) {
  const searchParams = useSearchParams();
  const [createdAt, setCreatedAt] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const token = searchParams.get("token");

  const { mutate: handleResendEmail, isPending } =
    trpc.misc.resendVerificationEmailByToken.useMutation({
      onError: ({ message }) =>
        toast({
          title: "Something went wrong",
          description: message,
        }),
      onSuccess: ({ toastTitle, toastDescription, createdAt }) => {
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        setCreatedAt(createdAt);
      },
    });

  const timeRemaining = useMemo(() => {
    if (!createdAt) return 0;
    const diff = differenceInSeconds(currentTime, new Date(createdAt));
    const returnValue = 90 - diff;
    return returnValue > 0 ? returnValue : 0;
  }, [currentTime, createdAt]);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  return (
    <div className="flex select-none items-center justify-center gap-x-6">
      {!isInvalid && (
        <Button
          variant="cta"
          disabled={isPending || !!timeRemaining}
          onClick={() => handleResendEmail(token || "")}
          className="w-[9rem]"
        >
          {isPending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : !timeRemaining ? (
            "Resend Email"
          ) : (
            `Wait for ${timeRemaining}s`
          )}
        </Button>
      )}
      <Button
        asChild
        variant="ctaOutline"
        disabled={isPending}
        className="w-[9rem]"
      >
        <Link href="/contact">Contact us</Link>
      </Button>
    </div>
  );
}
