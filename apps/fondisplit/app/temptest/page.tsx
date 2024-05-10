"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createGroup } from "~/lib/actions";

export default function Page() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");

  async function handleSubmit() {
    const groupId = await createGroup("Navin", groupName);
    router.push(`/groups/${groupId}`);
  }

  return (
    <main className="flex h-full flex-col items-center justify-center gap-y-4">
      <h1 className="text-2xl font-bold">Create Group</h1>
      <form action={handleSubmit} className="flex flex-col space-y-2">
        <label className="space-x-2">
          <span>Group Name</span>
          <input
            type="text"
            name="name"
            required
            onChange={(event) => {
              setGroupName(event.target.value);
            }}
            className="p-2 text-sm text-black"
          />
        </label>
        <button type="submit">Create</button>
      </form>
    </main>
  );
}
