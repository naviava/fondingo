"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { z } from "@fondingo/utils/zod";
import { useForm } from "react-hook-form";
import { uuid } from "@fondingo/utils/uuid";
import { zodResolver } from "@hookform/resolvers/zod";

import { FaRegListAlt } from "react-icons/fa";
import { IoHomeOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoAirplaneOutline } from "react-icons/io5";

import { GroupTypeT } from "~/types";
import { GroupType } from "@fondingo/db-split";

import { GroupTypeOptions } from "~/components/group-type-options";
import { ScrollArea, ScrollBar } from "@fondingo/ui/scroll-area";
import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@fondingo/ui/form";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Group name cannot be empty" })
    .max(50, { message: "Group name cannot be longer than 50 characters" }),
  type: z.nativeEnum(GroupType),
});

export default function CreateGroupPage() {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedGroupType, setSelectedGroupType] = useState<GroupTypeT>(
    GroupType.TRIP,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
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

  const handleGroupTypeClick = useCallback(
    (value: GroupTypeT) => {
      setSelectedGroupType(value);
      form.setValue("type", value);
    },
    [form],
  );

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log(values);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between pt-4">
        <Button asChild variant="splitGhost">
          <Link href="/groups">Cancel</Link>
        </Button>
        <h1 className="text-lg font-semibold">Create a group</h1>
        <Button
          variant="splitGhost"
          onClick={() => {
            if (submitButtonRef.current) {
              submitButtonRef.current.click();
            }
          }}
        >
          Done
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="my-10 px-4">
            <FormField
              control={form.control}
              name="name"
              // @ts-ignore
              render={({ field }) => (
                <FormItem className="px-2">
                  <FormLabel className="font-bold">Group name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="NYC Trip"
                      {...field}
                      className="focus-visible:border-b-cta h-6 rounded-none border-b-2 bg-transparent px-0 py-3 text-lg font-medium transition placeholder:font-medium placeholder:text-neutral-400/70"
                    />
                  </FormControl>
                  <FormMessage />
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
