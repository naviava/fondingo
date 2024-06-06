"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { differenceInSeconds } from "@fondingo/utils/date-fns";
import { toast } from "@fondingo/ui/use-toast";
import { trpc } from "~/lib/trpc/client";

import { Button } from "@fondingo/ui/button";
import { Loader } from "@fondingo/ui/lucide";

export function ActionButtons() {
  const router = useRouter();
  const { data: session } = useSession();
  const [createdAt, setCreatedAt] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const { mutate: handleResendEmail, isPending } =
    trpc.user.resendVerificationEmail.useMutation({
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

  useEffect(() => {
    console.log(session?.user);
  }, [session?.user]);

  return (
    <div className="flex select-none items-center justify-center gap-x-6">
      <Button
        variant="cta"
        disabled={isPending || !!timeRemaining}
        onClick={() => {
          if (!session?.user) return router.push("/signin");
          handleResendEmail();
        }}
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
      <Button variant="ctaOutline" disabled={isPending} className="w-[9rem]">
        Contact us
      </Button>
    </div>
  );
}
