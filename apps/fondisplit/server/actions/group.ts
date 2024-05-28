"use server";

import splitdb, { ZGroupType, ZCurrencyCode } from "@fondingo/db-split";
import { privateProcedure } from "~/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "@fondingo/utils/zod";

// TODO: Check all routes that get user data. MUST NOT HAVE hashedPassword returned.

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

    const group = await splitdb.group.create({
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
    });

    if (!group)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create group. Try again later.",
      });

    return {
      groupId: group.id,
      toastTitle: `${group.name} created.`,
      toastDescription: "You can now invite members to the group.",
    };
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

    return {
      groupId: updatedGroup.id,
      toastTitle: `${updatedGroup.name} updated.`,
      toastDescription: "Group details have been updated.",
    };
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
      return {
        toastTitle: `${deletedGroup.name} deleted.`,
        toastDescription: "Group has been deleted.",
      };
    });
  });

/**
 * Retrieves all groups that the current user is a member of.
 *
 * @function
 * @param {Object} ctx - The context object containing the user information.
 * @returns {Promise<Array>} A promise that resolves to an array of group objects.
 * @throws Will throw an error if the database query fails.
 */
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
            include: { user: true },
          },
          to: {
            include: { user: true },
          },
        },
      },
    },
  });
  return groups || [];
});

/**
 * Retrieves a group by its ID. The group must include the current user as a member.
 *
 * @function
 * @param {Object} ctx - The context object containing the user information.
 * @param {string} groupId - The ID of the group to retrieve. This ID must be a non-empty string.
 * @returns {Promise<Object>} A promise that resolves to the group object. The group object includes its simplified debts and the associated users (both the 'from' and 'to' users).
 * @throws {TRPCError} Will throw a TRPCError with code "NOT_FOUND" and message "Group not found" if no group with the provided ID exists or if the current user is not a member of the group.
 */
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
          include: { user: true },
        },
        expenses: true,
        simplifiedDebts: {
          include: {
            from: {
              include: { user: true },
            },
            to: {
              include: { user: true },
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

// TODO: Consolidate these 2 functions into one.
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
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
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
      const addedUser = await splitdb.groupMember.update({
        where: { id: existingMemberInGroup.id },
        data: {
          name: memberName,
          isDeleted: false,
          userId: !!existingUser?.id ? existingUser?.id : "",
        },
      });
      return {
        toastTitle: `${addedUser.name} added to the group.`,
        toastDescription: "You can now split expenses with them.",
      };
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
      const newGroupMember = await splitdb.groupMember.create({
        data: {
          groupId,
          name: memberName,
          email: existingUser.email,
          userId: existingUser.id,
          role: "MEMBER",
        },
      });
      return {
        toastTitle: `${newGroupMember.name} added to the group.`,
        toastDescription: "You can now split expenses with them.",
      };
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
      return {
        toastTitle: `${newGroupMember.name} added to the group.`,
        toastDescription: `You can now split expenses with them. ${newTempFriend.email} has been added to your friends list.`,
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
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const updates = await splitdb.$transaction(async (db) => {
      const promises = newMembers.map(async (member) => {
        // Check if the user is already in the group.
        const existingMemberInGroup = await splitdb.groupMember.findUnique({
          where: {
            groupId_email: {
              groupId,
              email: member.email,
            },
          },
        });
        // Check if the user exists in the database and is a friend.
        const existingUser = await splitdb.user.findUnique({
          where: { email: member.email },
        });

        if (!!existingMemberInGroup && existingMemberInGroup.isDeleted) {
          const addedUser = await splitdb.groupMember.update({
            where: { id: existingMemberInGroup.id },
            data: {
              name: member.name,
              isDeleted: false,
              userId: !!existingUser?.id ? existingUser?.id : "",
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

/**
 * This function is a private procedure that retrieves the members of a group.
 * It takes a group ID as input and returns the members of the group.
 *
 * @function getMembers
 * @memberof module:group
 * @public
 * @param {string} groupId - The ID of the group. It must be a non-empty string.
 * @throws {TRPCError} Will throw an error if the group ID is not found or the user is not a member of the group.
 * @returns {Promise<Array<GroupMember>>} Returns a promise that resolves to an array of group members. Each group member is an object that includes the user details.
 *
 * @description
 * The function first checks if the user is a member of the group with the provided ID. If the user is not a member or the group does not exist, it throws a TRPCError with a "NOT_FOUND" code.
 * If the user is a member of the group, the function retrieves the members of the group from the database and returns them.
 * The function uses the `splitdb.group.findUnique` method to check if the user is a member of the group and the `splitdb.groupMember.findMany` method to retrieve the group members.
 */
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
      include: { user: true },
    });
    return groupMembers;
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

    try {
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
            message:
              "Assign someone else as Manager before removing this member",
          });

        const currentUserInGroup = group.members.find(
          (m) => m.userId === user.id,
        );
        if (
          member.email !== user.email &&
          currentUserInGroup?.role !== "MANAGER"
        )
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
        return {
          toastTitle: isSelf ? "You left" : "Member removed",
          toastDescription: isSelf
            ? `You are no longer part of ${group.name}`
            : `${updatedMember.name} has been removed from the group`,
        };
      });
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove member from group",
      });
    }
  });

/**
 * This function is used to get the debts of a group. It is a private procedure that takes a string input representing the group ID.
 *
 * The function performs the following steps:
 * - It checks if the group ID is at least 1 character long. If not, it throws an error with the message "Group ID cannot be empty".
 * - It retrieves the user from the context object.
 * - It queries the database to find a group with the given ID that includes the user as a member. If no such group is found, it throws an error with the code "NOT_FOUND" and the message "Group not found".
 * - It queries the database to find all simplified debts associated with the group. It includes the 'from' and 'to' fields in the query to get the users involved in each debt.
 * - It returns the debts as an array. If no debts are found, it returns an empty array.
 *
 * @async
 * @function
 * @param {Object} ctx - The context object, which includes the user.
 * @param {string} groupId - The ID of the group.
 * @returns {Promise<Array>} A promise that resolves to an array of simplified debts.
 * @throws {TRPCError} If the group ID is too short or if no group is found.
 */
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
          include: { user: true },
        },
        to: {
          include: { user: true },
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

    const res = await calculateDebts(groupId);
    if (!("success" in res) || !res.success)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate debts",
      });
    return {
      toastTitle: `${group.name} debts calculated.`,
      toastDescription: "Debts have been calculated and stored",
    };
  });

/**
 * This function is used to calculate and store the simplified debts for a group. It takes a string input representing the group ID.
 *
 * The function performs the following steps:
 * - It starts a transaction on the database.
 * - It deletes all existing simplified debts for the group.
 * - It retrieves all payments and splits associated with the group from the database.
 * - It retrieves all settlements associated with the group from the database.
 * - It calculates the net balance for each member of the group by adding the amounts they have paid and subtracting the amounts they owe.
 * - It subtracts the settled amounts from the balances.
 * - It simplifies the debts by repeatedly finding the member who owes the most and the member who is owed the most, and creating a debt from the former to the latter for the smaller of the two amounts. It updates the balances accordingly and removes any balances that have become zero.
 * - It stores the simplified debts in the database.
 * - If all operations are successful, it returns an object with a 'success' property and a message indicating that the simplified debts were calculated and stored.
 * - If any operation fails, it catches the error, logs it to the console, and returns an object with an 'error' property and a message indicating that there was an error calculating the simplified debts.
 *
 * @async
 * @function
 * @param {string} groupId - The ID of the group.
 * @returns {Promise<{ success: string } | { error: string }>} A promise that resolves to an object with either a 'success' or 'error' property.
 * @throws {Error} If there is an error calculating the simplified debts.
 */
export async function calculateDebts(
  groupId: string,
): Promise<{ success: string } | { error: string }> {
  "use server";

  try {
    return splitdb.$transaction(async (db) => {
      // Delete existing simplified debts for the group
      await db.simplifiedDebt.deleteMany({
        where: { groupId },
      });

      // Calculate net balances.
      const payments = await db.expensePayment.findMany({
        where: {
          expense: { groupId },
        },
        include: { expense: true },
      });
      const splits = await db.expenseSplit.findMany({
        where: {
          expense: { groupId },
        },
        include: { expense: true },
      });

      // Fetch settlement entries
      const settlements = await db.settlement.findMany({
        where: {
          groupId,
        },
      });

      const balances: { [key: string]: number } = {};
      for (const payment of payments) {
        const paidBy = payment.groupMemberId;
        const amount = payment.amount;

        if (!balances[paidBy]) balances[paidBy] = 0;
        balances[paidBy] += amount;
      }

      for (const split of splits) {
        const owes = split.groupMemberId;
        const amount = split.amount;

        if (!balances[owes]) balances[owes] = 0;
        balances[owes] -= amount;
      }

      // Subtract settled amounts from balances
      for (const settlement of settlements) {
        const paidBy = settlement.fromId;
        const receivedBy = settlement.toId;
        const amount = settlement.amount;

        if (!balances[paidBy]) balances[paidBy] = 0;
        if (!balances[receivedBy]) balances[receivedBy] = 0;
        balances[paidBy] += amount;
        balances[receivedBy] -= amount;
      }

      // Simplify debts
      const debts: {
        from: string;
        to: string;
        amount: number;
      }[] = [];

      while (
        Object.keys(balances).length > 0 &&
        Object.keys(balances).length > 1
      ) {
        const maxOwed = Object.keys(balances).reduce((a, b) =>
          balances[a]! > balances[b]! ? a : b,
        );
        const maxOwing = Object.keys(balances).reduce((a, b) =>
          balances[a]! < balances[b]! ? a : b,
        );
        const amount = Math.min(balances[maxOwed]!, -balances[maxOwing]!);

        debts.push({
          from: maxOwing,
          to: maxOwed,
          amount,
        });
        balances[maxOwed]! -= amount;
        balances[maxOwing]! += amount;

        if (balances[maxOwed] === 0) delete balances[maxOwed];
        if (balances[maxOwing] === 0) delete balances[maxOwing];
      }

      // Store simplified debts in the database
      for (const debt of debts) {
        if (!!debt.amount) {
          await db.simplifiedDebt.create({
            data: {
              fromId: debt.from,
              toId: debt.to,
              amount: debt.amount,
              groupId,
            },
          });
        }
      }
      await db.group.update({
        where: { id: groupId },
        data: {
          lastCacluatedDebtsAt: new Date(),
        },
      });
      return { success: "Simplified debts calculated and stored" };
    });
  } catch (err) {
    console.error("\n\nError calculating simplified debts:\n\n", err);
    return { error: "Error calculating simplified debts" };
  }
}
