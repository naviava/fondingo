"use client";

import { useRouter } from "next/navigation";

import { useChangeCurrencyModal } from "@fondingo/store/fsplit";
import { toast } from "@fondingo/ui/use-toast";
import { trpc } from "~/lib/trpc/client";

import { Separator } from "@fondingo/ui/separator";
import { Button } from "@fondingo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fondingo/ui/dialog";

import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";
import { CurrencyCode } from "@fondingo/db-split";

export function ChangeCurrencyModal() {
  const router = useRouter();
  const { isOpen, onClose } = useChangeCurrencyModal((state) => state);

  const {
    mutate: handleChangeCurrency,
    isPending,
    isSuccess,
  } = trpc.user.changePreferredCurrency.useMutation({
    onError: ({ message }) =>
      toast({
        title: "Something went wrong",
        description: message,
      }),
    onSuccess: ({ toastTitle, toastDescription }) => {
      toast({
        title: toastTitle,
        description: toastDescription,
      });
      onClose();
      router.refresh();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideDefaultCloseButton className="px-0 py-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="ctaGhost"
              onClick={onClose}
              disabled={isPending || isSuccess}
              className="min-w-[5rem] text-sm md:text-base"
            >
              Close
            </Button>
            <DialogTitle
              className={cn("text-base md:text-lg", hfont.className)}
            >
              Preferred currency
            </DialogTitle>
            <Button
              size="sm"
              variant="ctaGhost"
              disabled={isPending || isSuccess}
              onClick={() => {}}
              className="min-w-[5rem] text-sm md:text-base"
            >
              Submit
            </Button>
          </div>
        </DialogHeader>
        <Separator />
      </DialogContent>
    </Dialog>
  );
}
