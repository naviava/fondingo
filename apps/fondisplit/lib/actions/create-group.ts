"use server";

import splitdb from "@fondingo/db-split";

export async function createGroup(creatorId: string, name: string) {
  // Create a new group with the given name and the creator as a member with role "MANAGER"
  // Return the group ID
  try {
    const group = await splitdb.group.create({
      data: {
        name,
        groupMembers: {
          create: {
            name: creatorId,
            role: "MANAGER",
          },
        },
      },
    });
    return group.id;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create group");
  }
}
