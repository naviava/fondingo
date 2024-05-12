"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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

import { GroupType } from "@fondingo/db-split";
import { TGroupType } from "~/types";

import { GroupTypeOptions } from "~/components/create-group/group-type-options";
import { ScrollArea, ScrollBar } from "@fondingo/ui/scroll-area";
import { ColorPicker } from "~/components/color-picker";
import { useToast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@fondingo/ui/form";

import { trpc } from "~/lib/trpc/client";

const formSchema = z.object({
  groupName: z
    .string()
    .min(1, { message: "Group name cannot be empty" })
    .max(50, { message: "Group name cannot be longer than 50 characters" }),
  color: z.string().min(1, { message: "Color cannot be empty" }),
  type: z.nativeEnum(GroupType),
});

export default function CreateGroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [color, setColor] = useState("#00968a");
  const [selectedGroupType, setSelectedGroupType] = useState<TGroupType>(
    GroupType.TRIP,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupName: "",
      color,
      type: GroupType.TRIP,
    },
  });

  const groupTypeOptions = useMemo(
    () => [
      {
        id: uuid(),
        label: "Trip",
        value: GroupType.TRIP,
        icon: IoAirplaneOutline,
        customClasses: "-rotate-[30deg]",
      },
      {
        id: uuid(),
        label: "Home",
        value: GroupType.HOME,
        icon: IoHomeOutline,
      },
      {
        id: uuid(),
        label: "Couple",
        value: GroupType.COUPLE,
        icon: IoMdHeartEmpty,
      },
      {
        id: uuid(),
        label: "Other",
        value: GroupType.OTHER,
        icon: FaRegListAlt,
      },
    ],
    [],
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

  const { mutate: handleCreateGroup, isPending } =
    trpc.group.createGroup.useMutation({
      onError: ({ message }) =>
        toast({
          title: "Something went wrong.",
          description: message,
        }),
      onSuccess: ({ groupId, toastTitle, toastDescription }) => {
        toast({
          title: toastTitle,
          description: toastDescription,
        });
        form.reset();
        router.push(`/groups/${groupId}`);
      },
    });

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    handleCreateGroup(values);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between px-2 pt-4">
        <Button asChild variant="splitGhost" disabled={isPending}>
          <Link href="/groups">Cancel</Link>
        </Button>
        <h1 className="text-lg font-semibold">Create a group</h1>
        <Button
          variant="splitGhost"
          disabled={isPending}
          className="w-20"
          onClick={() => {
            if (submitButtonRef.current) {
              submitButtonRef.current.click();
            }
          }}
        >
          {isPending ? <Loader className="h-6 w-6 animate-spin" /> : "Done"}
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
                  <FormLabel className="font-bold">Group name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="NYC Trip"
                      disabled={isPending}
                      {...field}
                      className="focus-visible:border-b-cta h-6 rounded-none border-b-2 bg-transparent px-0 py-3 text-lg font-medium transition placeholder:font-medium placeholder:text-neutral-400/70"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <ScrollArea hideVerticalScrollbar>
            <div className="flex items-center gap-x-4 px-6 py-4">
              {groupTypeOptions.map((option) => (
                <GroupTypeOptions
                  key={option.id}
                  {...option}
                  isSelected={selectedGroupType === option.value}
                  onClick={handleGroupTypeClick}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <button ref={submitButtonRef} type="submit" className="hidden">
            Submit
          </button>
        </form>
      </Form>
    </>
  );
}
