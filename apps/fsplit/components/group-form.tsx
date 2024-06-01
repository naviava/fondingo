"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { uuid } from "@fondingo/utils/uuid";
import { useForm } from "react-hook-form";
import { z } from "@fondingo/utils/zod";

import { IoAirplaneOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoHomeOutline } from "react-icons/io5";
import { FaRegListAlt } from "react-icons/fa";
import { Loader } from "@fondingo/ui/lucide";

import { CurrencyCode, ZGroupType, ZCurrencyCode } from "@fondingo/db-split";
import { trpc } from "~/lib/trpc/client";
import { TGroupType } from "~/types";

import { GroupTypeOptions } from "~/components/create-group/group-type-options";
import { ScrollArea, ScrollBar } from "@fondingo/ui/scroll-area";
import { currencyIconMap } from "@fondingo/ui/constants";
import { ColorPicker } from "~/components/color-picker";
import { useToast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { Label } from "@fondingo/ui/label";
import { Input } from "@fondingo/ui/input";
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
  FormLabel,
  FormMessage,
} from "@fondingo/ui/form";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

const formSchema = z.object({
  groupName: z
    .string()
    .min(1, { message: "Group name cannot be empty" })
    .max(50, { message: "Group name cannot be longer than 50 characters" }),
  color: z.string().min(1, { message: "Color cannot be empty" }),
  type: z.nativeEnum(ZGroupType),
  currency: z.nativeEnum(ZCurrencyCode),
});

interface IProps {
  isEditing?: boolean;
  initialData?: {
    groupId: string;
    groupName: string;
    color: string;
    type: TGroupType;
    currency: CurrencyCode;
  };
}

export const GroupForm = memo(_GroupForm);
function _GroupForm({ isEditing, initialData }: IProps) {
  const router = useRouter();
  const { toast } = useToast();
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [color, setColor] = useState(initialData?.color || "#00968a");
  const [currency, setCurrency] = useState<CurrencyCode>(
    initialData?.currency || "USD",
  );
  const [selectedGroupType, setSelectedGroupType] = useState<TGroupType>(
    initialData?.type || "TRIP",
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupName: initialData?.groupName || "",
      color,
      type: ZGroupType.TRIP,
      currency: initialData?.currency || ZCurrencyCode.USD,
    },
  });

  const groupTypeOptions = useMemo(
    () => [
      {
        id: uuid(),
        label: "Trip",
        value: ZGroupType.TRIP,
        icon: IoAirplaneOutline,
        customClasses: "-rotate-[30deg]",
      },
      {
        id: uuid(),
        label: "Home",
        value: ZGroupType.HOME,
        icon: IoHomeOutline,
      },
      {
        id: uuid(),
        label: "Couple",
        value: ZGroupType.COUPLE,
        icon: IoMdHeartEmpty,
      },
      {
        id: uuid(),
        label: "Other",
        value: ZGroupType.OTHER,
        icon: FaRegListAlt,
      },
    ],
    [],
  );

  const CurrencyIcon = useMemo(
    () => currencyIconMap[currency].icon,
    [currency],
  );

  const handleColorChange = useCallback(
    (value: string) => {
      setColor(value);
      form.setValue("color", value);
    },
    [form],
  );

  const handleGroupTypeClick = useCallback(
    (value: TGroupType) => {
      setSelectedGroupType(value);
      form.setValue("type", value);
    },
    [form],
  );

  const utils = trpc.useUtils();
  const { mutate: handleCreateGroup, isPending: isPendingCreate } =
    trpc.group.createGroup.useMutation({
      onError: ({ message }) =>
        toast({
          variant: "destructive",
          title: "Something went wrong.",
          description: message,
        }),
      onSuccess: ({ groupId, toastTitle, toastDescription }) => {
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        form.reset();
        utils.group.getGroupById.invalidate();
        utils.group.getGroups.invalidate();
        router.push(`/groups/${groupId}`);
        router.refresh();
      },
    });
  const { mutate: handleEditGroup, isPending: isPendingEdit } =
    trpc.group.editGroup.useMutation({
      onError: ({ message }) =>
        toast({
          variant: "destructive",
          title: "Something went wrong.",
          description: message,
        }),
      onSuccess: ({ groupId, toastTitle, toastDescription }) => {
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        form.reset();
        utils.group.getGroupById.invalidate();
        utils.group.getGroups.invalidate();
        router.push(`/groups/${groupId}/settings`);
        router.refresh();
      },
    });

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (isEditing)
        handleEditGroup({ ...values, groupId: initialData?.groupId || "" });
      else handleCreateGroup(values);
    },
    [isEditing, handleCreateGroup, handleEditGroup, initialData?.groupId],
  );

  return (
    <>
      <div className="flex items-center justify-between px-2 pt-4">
        <Button
          variant="ctaGhost"
          disabled={isPendingCreate || isPendingEdit}
          className={hfont.className}
        >
          <Link
            href={
              isEditing ? `/groups/${initialData?.groupId}/settings` : "/groups"
            }
          >
            Cancel
          </Link>
        </Button>
        <h1 className={cn("text-lg font-semibold", hfont.className)}>
          {isEditing ? "Customize group" : "Create a group"}
        </h1>
        <Button
          type="button"
          variant="ctaGhost"
          disabled={isPendingCreate || isPendingEdit}
          className={cn("w-20", hfont.className)}
          onClick={() => {
            if (submitButtonRef.current) {
              submitButtonRef.current.click();
            }
          }}
        >
          {isPendingCreate || isPendingEdit ? (
            <Loader className="h-6 w-6 animate-spin" />
          ) : (
            "Done"
          )}
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="my-10 flex items-center gap-x-4 px-4">
            <ColorPicker color={color} handleColorChange={handleColorChange} />
            <FormField
              control={form.control}
              name="groupName"
              // @ts-ignore
              render={({ field }) => (
                <FormItem className="w-full px-2">
                  <FormLabel className={cn("font-bold", hfont.className)}>
                    Group name
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="NYC Trip"
                      disabled={isPendingCreate || isPendingEdit}
                      {...field}
                      className="form-input"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <ScrollArea hideVerticalScrollbar>
            <ul className="flex items-center gap-x-4 px-6 py-4">
              {groupTypeOptions.map((option) => (
                <GroupTypeOptions
                  key={option.id}
                  {...option}
                  isSelected={selectedGroupType === option.value}
                  onClick={handleGroupTypeClick}
                />
              ))}
            </ul>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="mt-6 flex flex-col items-center justify-center space-y-8">
            <Label className={cn("text-base font-bold", hfont.className)}>
              Currency
            </Label>
            <div className="border-2 border-dashed border-neutral-300 p-3">
              <CurrencyIcon className="h-16 w-16" />
            </div>
            <FormField
              control={form.control}
              name="currency"
              // @ts-ignore
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value: CurrencyCode) => {
                      setCurrency(value);
                      return field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="mx-auto w-[13rem] font-medium">
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-neutral-100">
                      {Object.values(currencyIconMap).map((c) => (
                        <SelectItem
                          key={c.code}
                          value={c.code}
                          className="focus:bg-white"
                        >
                          {`${c.code} - ${c.name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will be the default currency for the group.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <button ref={submitButtonRef} type="submit" className="hidden">
            Submit
          </button>
        </form>
      </Form>
    </>
  );
}
