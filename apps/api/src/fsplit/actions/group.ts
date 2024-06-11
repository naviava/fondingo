import splitdb, { ZGroupType, ZCurrencyCode } from "@fondingo/db-split";
import { calculateDebts } from "../utils/calculate-debts";
import { privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "@fondingo/utils/zod";

export const createGroup = privateProcedure
  .input(
    z.object({
      groupName: z
        .string()
        .min(1, { message: "Group name cannot be empty" })
        .max(50, { message: "Group name cannot be longer than 50 characters" }),
      color: z.string().min(1, { message: "Color cannot be empty" }),
      type: z.nativeEnum(ZGroupType, { message: "Invalid group type" }),
      currency: z.nativeEnum(ZCurrencyCode, { message: "Invalid currency" }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupName, color, type, currency } = input;

    return splitdb.$transaction(async (db) => {
      const group = await db.group.create({
        data: {
          name: groupName,
          color,
          type,
          currency,
          members: {
            create: {
              userId: user.id,
              name: user.name || user.email,
              email: user.email,
              role: "MANAGER",
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      if (!group)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create group. Try again later.",
        });

      const groupLog = await db.log.create({
        data: {
          type: "GROUP",
          userId: user.id,
          groupId: group.id,
          message: `Group "${group.name}" was created by ${user.name}.`,
        },
      });
      if (!groupLog)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create group log. Couldn't create group.",
        });
      const userLog = await db.log.create({
        data: {
          type: "USER",
          userId: user.id,
          message: `You created the group, "${group.name}".`,
        },
      });
      if (!userLog)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user log. Couldn't create group.",
        });

      const groupMemberLog = await db.log.createMany({
        data: group.members.map((member) => ({
          type: "GROUP",
          userId: user.id,
          groupId: group.id,
          message: `${member.name} joined the group.`,
        })),
      });
      if (!groupMemberLog)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create group member log. Couldn't create group.",
        });

      return {
        groupId: group.id,
        toastTitle: `${group.name} created.`,
        toastDescription: "You can now invite members to the group.",
      };
    });
  });

export const editGroup = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      groupName: z
        .string()
        .min(1, { message: "Group name cannot be empty" })
        .max(50, { message: "Group name cannot be longer than 50 characters" }),
      color: z.string().min(1, { message: "Color cannot be empty" }),
      type: z.nativeEnum(ZGroupType, { message: "Invalid group type" }),
      currency: z.nativeEnum(ZCurrencyCode, { message: "Invalid currency" }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, groupName, color, type, currency } = input;

    return splitdb.$transaction(async (db) => {
      const existingGroup = await db.group.findUnique({
        where: {
          id: groupId,
          members: {
            some: { userId: user.id },
          },
        },
        include: { members: true },
      });
      if (!existingGroup)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });

      const userInGroup = existingGroup.members.find(
        (member) => member.userId === user.id,
      );
      if (!userInGroup)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this group",
        });

      const updatedGroup = await splitdb.group.update({
        where: {
          id: groupId,
          members: {
            some: { userId: user.id },
          },
        },
        data: {
          name: groupName,
          color,
          type,
          currency,
        },
      });
      if (!updatedGroup)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update group. Try again later.",
        });

      if (existingGroup.name !== updatedGroup.name) {
        const groupLog = await db.log.create({
          data: {
            type: "GROUP",
            userId: user.id,
            groupId: updatedGroup.id,
            message: `Group name was changed from "${existingGroup.name}" to "${updatedGroup.name}" by ${userInGroup.name || userInGroup.email}.`,
          },
        });
        if (!groupLog)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create group log. Couldn't update group.",
          });
      }
      if (existingGroup.color !== updatedGroup.color) {
        const groupLog = await db.log.create({
          data: {
            type: "GROUP",
            userId: user.id,
            groupId: updatedGroup.id,
            message: `Group color was changed by ${userInGroup.name || userInGroup.email}.`,
          },
        });
        if (!groupLog)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create group log. Couldn't update group.",
          });
      }
      if (existingGroup.type !== updatedGroup.type) {
        const groupLog = await db.log.create({
          data: {
            type: "GROUP",
            userId: user.id,
            groupId: updatedGroup.id,
            message: `Group type was changed from "${existingGroup.type}" to "${updatedGroup.type}", by ${userInGroup.name || userInGroup.email}.`,
          },
        });
        if (!groupLog)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create group log. Couldn't update group.",
          });
      }
      if (existingGroup.currency !== updatedGroup.currency) {
        const groupLog = await db.log.create({
          data: {
            type: "GROUP",
            userId: user.id,
            groupId: updatedGroup.id,
            message: `Group currency was changed from "${existingGroup.currency}" to "${updatedGroup.currency}", by ${userInGroup.name || userInGroup.email}.`,
          },
        });
        if (!groupLog)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create group log. Couldn't update group.",
          });
      }

      return {
        groupId: updatedGroup.id,
        toastTitle: `${updatedGroup.name} updated.`,
        toastDescription: "Group details have been updated.",
      };
    });
  });

export const deleteGroupById = privateProcedure
  .input(z.string().min(1, { message: "Group ID cannot be empty" }))
  .mutation(async ({ ctx, input: groupId }) => {
    const { user } = ctx;

    const existingGroup = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
      include: { members: true },
    });
    if (!existingGroup)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const currentMember = await splitdb.groupMember.findUnique({
      where: {
        groupId_email: {
          groupId,
          email: user.email,
        },
        isDeleted: false,
        role: "MANAGER",
      },
    });
    if (!currentMember)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this group",
      });

    return splitdb.$transaction(async (db) => {
      await db.simplifiedDebt.deleteMany({
        where: { groupId: existingGroup.id },
      });
      await db.expense.deleteMany({
        where: { groupId: existingGroup.id },
      });
      await db.settlement.deleteMany({
        where: { groupId: existingGroup.id },
      });
      await db.groupMember.deleteMany({
        where: { groupId: existingGroup.id },
      });
      const deletedGroup = await db.group.delete({
        where: { id: existingGroup.id },
      });
      if (!deletedGroup)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete group. Try again later.",
        });

      const log = await db.log.create({
        data: {
          type: "USER",
          userId: user.id,
          message: `You deleted the group, "${deletedGroup.name}".`,
        },
      });
      if (!log)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create log. Couldn't delete group.",
        });
      return {
        toastTitle: `${deletedGroup.name} deleted.`,
        toastDescription: "Group has been deleted.",
      };
    });
  });

export const getGroups = privateProcedure.query(async ({ ctx }) => {
  const { user } = ctx;
  const groups = await splitdb.group.findMany({
    where: {
      members: {
        some: { userId: user.id, isDeleted: false },
      },
    },
    include: {
      simplifiedDebts: {
        include: {
          from: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          to: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  return groups || [];
});

export const getGroupById = privateProcedure
  .input(z.string().min(1, { message: "Group ID cannot be empty" }))
  .query(async ({ ctx, input: groupId }) => {
    const { user } = ctx;
    const group = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        expenses: true,
        settlements: true,
        simplifiedDebts: {
          include: {
            from: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
            to: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const filteredGroupMembers = group.members.filter(
      (member) => !member.isDeleted,
    );
    group.members = filteredGroupMembers;
    return group;
  });

export const addMember = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      memberName: z.string().min(1, { message: "Name cannot be empty" }),
      email: z.string().email({ message: "Invalid email" }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, memberName, email } = input;

    const group = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
      include: { members: true },
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });
    const userInGroup = group.members.find(
      (member) => member.userId === user.id,
    );
    if (!userInGroup)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to find user in the group",
      });

    // Check if the user is trying to add themselves to the group.
    if (user.email === email)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You cannot add yourself to the group.",
      });

    // Check if the user is already in the group.
    const existingMemberInGroup = await splitdb.groupMember.findUnique({
      where: {
        groupId_email: {
          groupId,
          email,
        },
      },
    });
    // Check if the user exists in the database and is a friend.
    const existingUser = await splitdb.user.findUnique({
      where: { email },
    });

    if (!!existingMemberInGroup && existingMemberInGroup.isDeleted) {
      return splitdb.$transaction(async (db) => {
        const addedUser = await db.groupMember.update({
          where: { id: existingMemberInGroup.id },
          data: {
            name: memberName,
            isDeleted: false,
            userId: !!existingUser?.id ? existingUser?.id : "",
          },
        });
        if (!addedUser)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add user to the group",
          });

        const log = await db.log.create({
          data: {
            type: "GROUP",
            groupId,
            userId: user.id,
            message: `${addedUser.name} was added back to the group, by ${userInGroup.name}.`,
          },
        });
        if (!log)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create log. Couldn't add user to group.",
          });
        return {
          toastTitle: `${addedUser.name} added to the group.`,
          toastDescription: "You can now split expenses with them.",
        };
      });
    }
    if (!!existingMemberInGroup && !existingMemberInGroup.isDeleted)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is already in this group.",
      });

    let isFriend = false;
    if (!!existingUser) {
      const existingUserInFriendsList = await splitdb.friend.findFirst({
        where: {
          OR: [
            {
              user1Id: user.id,
              user2Id: existingUser.id,
            },
            {
              user1Id: existingUser.id,
              user2Id: user.id,
            },
          ],
        },
      });

      // If user exists in the database but is not a friend, throw an error.
      if (!existingUserInFriendsList)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You can add an existing account only if they are your friend.",
        });
      else {
        isFriend = true;
      }
    }

    // If the user exists and is a friend, add them to the group.
    if (!!existingUser && isFriend) {
      return splitdb.$transaction(async (db) => {
        const newGroupMember = await db.groupMember.create({
          data: {
            groupId,
            name: memberName,
            email: existingUser.email,
            userId: existingUser.id,
            role: "MEMBER",
          },
        });
        if (!newGroupMember)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add user to the group",
          });

        const log = await db.log.create({
          data: {
            type: "GROUP",
            groupId,
            userId: user.id,
            message: `${newGroupMember.name} was added to the group by ${userInGroup.name}.`,
          },
        });
        if (!log)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create log. Couldn't add user to group.",
          });
        return {
          toastTitle: `${newGroupMember.name} added to the group.`,
          toastDescription: "You can now split expenses with them.",
        };
      });
    }

    // If the user does not exist, add them to the group, and add them as a temp friend.
    // TODO: Send an invitation email to the user.
    return splitdb.$transaction(async (db) => {
      const newGroupMember = await db.groupMember.create({
        data: {
          groupId,
          name: memberName,
          email,
          role: "MEMBER",
        },
      });
      if (!newGroupMember)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add user to the group",
        });

      const newMemberLog = await db.log.create({
        data: {
          type: "GROUP",
          groupId,
          userId: user.id,
          message: `${newGroupMember.name} was added to the group by ${userInGroup.name}.`,
        },
      });
      if (!newMemberLog)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to create new member log. Couldn't add user to group.",
        });

      const existingTempFriend = await db.tempFriend.findUnique({
        where: {
          userId_email: {
            userId: user.id,
            email,
          },
        },
      });
      if (!!existingTempFriend)
        return {
          toastTitle: `${newGroupMember.name} added to the group.`,
          toastDescription: `You can now split expenses with them.`,
        };

      const newTempFriend = await db.tempFriend.create({
        data: {
          name: memberName,
          email,
          userId: user.id,
        },
      });
      if (!newTempFriend)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create temp friend. Couldn't add user to group.",
        });
      const newTempFriendLog = await db.log.create({
        data: {
          type: "USER",
          userId: user.id,
          message: `${newTempFriend.name} was added to your temp friends.`,
        },
      });
      if (!newTempFriendLog)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to create new temp friend log. Couldn't add user to group.",
        });
      return {
        toastTitle: `${newGroupMember.name} added to the group.`,
        toastDescription: `You can now split expenses with them. ${newTempFriend.name} has been added to your friends list.`,
      };
    });
  });

export const addMultipleMembers = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      newMembers: z.array(
        z.object({
          id: z.string().min(1, { message: "User ID cannot be empty" }),
          name: z.string().min(1, { message: "Name cannot be empty" }),
          email: z.string().email({ message: "Invalid email" }),
        }),
      ),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, newMembers } = input;

    const group = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
      include: { members: true },
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });
    const userInGroup = group.members.find(
      (member) => member.userId === user.id,
    );
    if (!userInGroup)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to find user in the group",
      });

    const updates = await splitdb.$transaction(async (db) => {
      const promises = newMembers.map(async (member) => {
        // Check if the user is already in the group.
        const existingMemberInGroup = await db.groupMember.findUnique({
          where: {
            groupId_email: {
              groupId,
              email: member.email,
            },
          },
        });
        // Check if the user exists in the database and is a friend.
        const existingUser = await db.user.findUnique({
          where: { email: member.email },
        });

        if (!!existingMemberInGroup && existingMemberInGroup.isDeleted) {
          const addedUser = await db.groupMember.update({
            where: { id: existingMemberInGroup.id },
            data: {
              name: member.name,
              isDeleted: false,
              userId: !!existingUser?.id ? existingUser?.id : "",
            },
          });
          await db.log.create({
            data: {
              type: "GROUP",
              groupId,
              userId: user.id,
              message: `${addedUser.name} was added back to the group by ${userInGroup.name}.`,
            },
          });
          return addedUser;
        }
        if (!!existingMemberInGroup && !existingMemberInGroup.isDeleted)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is already in this group.",
          });

        let isFriend = false;
        if (!!existingUser) {
          const existingUserInFriendsList = await db.friend.findFirst({
            where: {
              OR: [
                {
                  user1Id: user.id,
                  user2Id: existingUser.id,
                },
                {
                  user1Id: existingUser.id,
                  user2Id: user.id,
                },
              ],
            },
          });

          // If user exists in the database but is not a friend, throw an error.
          if (!existingUserInFriendsList)
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "You can add an existing account only if they are your friend.",
            });
          else {
            isFriend = true;
          }
        }

        // If the user exists and is a friend, add them to the group.
        if (!!existingUser && isFriend) {
          const newGroupMember = await db.groupMember.create({
            data: {
              groupId,
              name: member.name,
              email: existingUser.email,
              userId: existingUser.id,
              role: "MEMBER",
            },
          });
          await db.log.create({
            data: {
              type: "GROUP",
              groupId,
              userId: user.id,
              message: `${newGroupMember.name} was added to the group by ${userInGroup.name}.`,
            },
          });
          return newGroupMember;
        }

        // TODO: Send an invitation email to the user.
        // If the user does not exist, add them to the group, and add them as a temp friend.
        const newGroupMember = await db.groupMember.create({
          data: {
            groupId,
            name: member.name,
            email: member.email,
            role: "MEMBER",
          },
        });
        await db.log.create({
          data: {
            type: "GROUP",
            groupId,
            userId: user.id,
            message: `${newGroupMember.name} was added to the group by ${userInGroup.name}.`,
          },
        });

        const existingTempFriend = await db.tempFriend.findUnique({
          where: {
            userId_email: {
              userId: user.id,
              email: member.email,
            },
          },
        });
        if (!!existingTempFriend) return newGroupMember;

        await db.tempFriend.create({
          data: {
            name: member.name,
            email: member.email,
            userId: user.id,
          },
        });
        await db.log.create({
          data: {
            type: "USER",
            userId: user.id,
            message: `${member.name} was added to your temp friends.`,
          },
        });
        return newGroupMember;
      });
      return Promise.all(promises);
    });
    if (!updates.length)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add members to the group",
      });
    return {
      toastTitle: `${updates.length} new ${updates.length === 1 ? "member" : "members"} added to the group.`,
      toastDescription: "You can now split expenses with them.",
    };
  });

export const getMembers = privateProcedure
  .input(z.string().min(1, { message: "Group ID cannot be empty" }))
  .query(({ ctx, input: groupId }) => {
    const { user } = ctx;
    const isInGroup = splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
    });
    if (!isInGroup)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const groupMembers = splitdb.groupMember.findMany({
      where: {
        groupId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    return groupMembers;
  });

export const isGroupManager = privateProcedure
  .input(z.string().min(1, { message: "Group ID cannot be empty" }))
  .query(async ({ ctx, input: groupId }) => {
    const { user } = ctx;
    const existingGroup = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
    });
    console.log(existingGroup);
    if (!existingGroup)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const isManager = await splitdb.groupMember.findFirst({
      where: {
        groupId: existingGroup.id,
        userId: user.id,
        role: "MANAGER",
      },
    });
    return !!isManager;
  });

export const removeMemberFromGroup = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      memberId: z.string().min(1, { message: "Member ID cannot be empty" }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, memberId } = input;

    return splitdb.$transaction(async (db) => {
      const group = await db.group.findUnique({
        where: {
          id: groupId,
          members: {
            some: { userId: user.id },
          },
        },
        include: { members: true },
      });
      if (!group)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      if (group.members.length === 1)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove the last member from the group",
        });

      const member = await db.groupMember.findUnique({
        where: {
          groupId,
          id: memberId,
        },
      });
      if (!member)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      if (member.isDeleted)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Member not found",
        });

      const noOfManagers = group.members.filter(
        (m) => m.role === "MANAGER" && !m.isDeleted,
      ).length;
      if (noOfManagers === 1 && member.role === "MANAGER")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Assign someone else as Manager before removing this member",
        });

      const currentUserInGroup = group.members.find(
        (m) => m.userId === user.id,
      );
      if (!currentUserInGroup)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find user in the group",
        });
      if (member.email !== user.email && currentUserInGroup?.role !== "MANAGER")
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to remove this member",
        });

      const isSelf = user.email === member.email;
      const hasPendingDebts = await db.simplifiedDebt.findFirst({
        where: {
          groupId,
          OR: [{ fromId: memberId }, { toId: memberId }],
        },
      });
      if (!!hasPendingDebts)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${isSelf ? "You have" : member.name + " has"} pending debts in the group`,
        });

      const updatedMember = await db.groupMember.update({
        where: { id: member.id },
        data: {
          name: "(deleted)",
          isDeleted: true,
          role: "MEMBER",
          userId: null,
        },
      });
      if (!updatedMember)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove member from group",
        });

      const log = await db.log.create({
        data: {
          type: "GROUP",
          groupId,
          userId: user.id,
          message: isSelf
            ? `${member.name} left the group.`
            : `${member.name} was removed by ${currentUserInGroup.name}.`,
        },
      });
      if (!log)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create log. Couldn't remove member from group.",
        });

      return {
        toastTitle: isSelf ? "You left" : "Member removed",
        toastDescription: isSelf
          ? `You are no longer part of ${group.name}`
          : `${member.name} has been removed from the group`,
      };
    });
  });

export const getDebts = privateProcedure
  .input(z.string().min(1, { message: "Group ID cannot be empty" }))
  .query(async ({ ctx, input: groupId }) => {
    const { user } = ctx;
    const group = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const debts = await splitdb.simplifiedDebt.findMany({
      where: { groupId },
      include: {
        from: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        to: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
    return debts || [];
  });

export const getDebtsByMemberId = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      memberId: z.string().min(1, { message: "Member ID cannot be empty" }),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, memberId } = input;

    const group = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const member = await splitdb.groupMember.findUnique({
      where: {
        groupId,
        id: memberId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    const credits = await splitdb.simplifiedDebt.findMany({
      where: {
        groupId,
        toId: memberId,
      },
      include: {
        from: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        to: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
    const debts = await splitdb.simplifiedDebt.findMany({
      where: {
        groupId,
        fromId: memberId,
      },
      include: {
        from: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        to: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
    const totalCredit = credits.reduce((acc, credit) => acc + credit.amount, 0);
    const totalDebt = debts.reduce((acc, debt) => acc + debt.amount, 0);
    const grossBalance = totalCredit - totalDebt;

    return {
      member,
      grossBalance,
      debts: debts || [],
      credits: credits || [],
      isInDebt: grossBalance < 0,
    };
  });

export const getGroupTotals = privateProcedure
  .input(z.string().min(1, { message: "Group ID cannot be empty" }))
  .query(async ({ ctx, input: groupId }) => {
    const { user } = ctx;

    const group = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const member = await splitdb.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        isDeleted: false,
      },
    });
    if (!member)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Member not found",
      });

    const expenses = await splitdb.expense.findMany({
      where: { groupId },
      include: {
        payments: {
          include: {
            groupMember: {
              include: { user: true },
            },
          },
        },
        splits: {
          include: {
            groupMember: {
              include: { user: true },
            },
          },
        },
      },
    });
    const settlements = await splitdb.settlement.findMany({
      where: { groupId },
      include: {
        from: {
          include: { user: true },
        },
        to: {
          include: { user: true },
        },
      },
    });

    const payments = expenses.flatMap((expense) => expense.payments);
    const splits = expenses.flatMap((expense) => expense.splits);
    const myPayments = payments.filter(
      (payment) => payment.groupMember.userId === user.id,
    );
    const mySplits = splits.filter(
      (split) => split.groupMember.userId === user.id,
    );

    const totalGroupSpending = expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0,
    );
    const totalYouPaidFor = myPayments.reduce(
      (acc, payment) => acc + payment.amount,
      0,
    );
    const yourTotalShare = mySplits.reduce(
      (acc, split) => acc + split.amount,
      0,
    );
    const paymentsMade = settlements.reduce((acc, settlement) => {
      if (settlement.from.userId === user.id) return acc + settlement.amount;
      return acc;
    }, 0);
    const paymentsReceived = settlements.reduce((acc, settlement) => {
      if (settlement.to.userId === user.id) return acc + settlement.amount;
      return acc;
    }, 0);

    const totalChangeInBalance =
      totalYouPaidFor - yourTotalShare - paymentsReceived + paymentsMade;

    return {
      paymentsMade,
      yourTotalShare,
      totalYouPaidFor,
      paymentsReceived,
      totalGroupSpending,
      totalChangeInBalance,
      currency: group.currency,
    };
  });

export const calculateGroupDebts = privateProcedure
  .input(z.string().min(1, { message: "Group ID cannot be empty" }))
  .mutation(async ({ ctx, input: groupId }) => {
    const { user } = ctx;
    const group = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
      include: { members: true },
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });
    if (
      group.lastCacluatedDebtsAt &&
      Date.now() - new Date(group.lastCacluatedDebtsAt).getTime() <
        1000 * 60 * 5
    )
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Debts can be manually calculated every 5 minutes. Try again later.",
      });
    const userInGroup = group.members.find(
      (member) => member.userId === user.id,
    );
    if (!userInGroup)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to find user in the group",
      });

    const res = await calculateDebts(groupId, true);
    if (!("success" in res) || !res.success)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate debts",
      });
    await splitdb.log.create({
      data: {
        type: "GROUP",
        groupId: group.id,
        userId: user.id,
        message: `Manual debts calculation requested by ${userInGroup.name || userInGroup.email}.`,
      },
    });
    return {
      toastTitle: `${group.name}`,
      toastDescription: "Debts have been calculated and stored",
    };
  });
