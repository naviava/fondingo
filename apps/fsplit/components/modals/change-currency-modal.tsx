"use client";

import { useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { useChangeCurrencyModal } from "@fondingo/store/fsplit";
import { TCurrencyCode, ZCurrencyCode } from "@fondingo/db-split";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@fondingo/ui/use-toast";
import { useForm } from "react-hook-form";
import { trpc } from "~/lib/trpc/client";
import { z } from "@fondingo/utils/zod";

import { currencyIconMap } from "@fondingo/ui/constants";
import { Button } from "@fondingo/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fondingo/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@fondingo/ui/form";
import { Separator } from "@fondingo/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fondingo/ui/dialog";

import { useUtils } from "~/hooks/use-utils";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

const formSchema = z.object({
  selectedCurrency: z.nativeEnum(ZCurrencyCode),
});

export function ChangeCurrencyModal() {
  const router = useRouter();
  const { invalidateUserQueries } = useUtils();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { data: user } = trpc.user.getAuthProfile.useQuery();
  const { currency, setCurrency, isOpen, onClose } = useChangeCurrencyModal(
    (state) => state,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { selectedCurrency: currency },
  });

  const CurrencyIcon = useMemo(
    () => currencyIconMap[currency].icon,
    [currency],
  );

  const { mutate: handleChangeCurrency, isPending } =
    trpc.user.changePreferredCurrency.useMutation({
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
        invalidateUserQueries();
        onClose();
        router.refresh();
      },
    });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (isPending) return;
      if (user?.preferredCurrency === values.selectedCurrency) return onClose();
      handleChangeCurrency(values.selectedCurrency);
    },
    [isPending, user?.preferredCurrency, onClose, handleChangeCurrency],
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        form.setValue("selectedCurrency", user?.preferredCurrency || currency);
        onClose();
      }}
    >
      <DialogContent hideDefaultCloseButton className="px-0 py-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="ctaGhost"
              onClick={onClose}
              disabled={isPending}
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
              disabled={isPending}
              onClick={() => {
                if (!!submitButtonRef.current) submitButtonRef.current.click();
              }}
              className="min-w-[5rem] text-sm md:text-base"
            >
              Submit
            </Button>
          </div>
        </DialogHeader>
        <Separator />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center justify-center space-y-8"
          >
            <div className="border-2 border-dashed border-neutral-300 p-3">
              <CurrencyIcon className="h-16 w-16" />
            </div>
            <FormField
              control={form.control}
              name="selectedCurrency"
              // @ts-ignore
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value: TCurrencyCode) => {
                      setCurrency(value);
                      return field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        disabled={isPending}
                        className="mx-auto w-[13rem] font-medium"
                      >
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-neutral-100">
                      {Object.values(currencyIconMap).map((c) => (
                        <SelectItem
                          key={c.code}
                          value={c.code}
                          disabled={isPending}
                          className="focus:bg-white"
                        >
                          {`${c.code} - ${c.name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="mx-auto w-[15rem] text-center md:w-auto">
                    This will be your default currency, when creating new
                    groups.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button ref={submitButtonRef} type="submit" className="hidden">
              Submit
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
