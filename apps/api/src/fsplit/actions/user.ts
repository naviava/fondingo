import { getServerSession } from "next-auth";
import { TRPCError } from "@trpc/server";
import splitdb from "@fondingo/db-split";

import { privateProcedure, publicProcedure } from "../trpc";
import { z } from "@fondingo/utils/zod";
import { hash } from "bcrypt";

export const getAuthProfile = publicProcedure.query(async () => {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    return null;
  }

  const user = await splitdb.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { hashedPassword, ...userWithoutPassword } = user;

  return userWithoutPassword;
});

export const createNewUser = publicProcedure
  .input(
    z.object({
      displayName: z
        .string()
        .min(1, { message: "Display name cannot be empty" })
        .max(20, {
          message: "Display name cannot be longer than 20 characters.",
        }),
      email: z.string().email({ message: "Invalid email" }),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      password: z.string().min(6, { message: "Password too short" }),
      confirmPassword: z.string(),
      phone: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const {
      displayName,
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
    } = input;

    if (password !== confirmPassword)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Passwords do not match.",
      });

    const existingUser = await splitdb.user.findFirst({
      where: { email },
    });
    if (!!existingUser)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User with that email already exists.",
      });

    // if (!!phone) {
    //   const existingPhoneNumber = await splitdb.user.findFirst({
    //     where: { phone },
    //   });
    //   if (!!existingPhoneNumber)
    //     throw new TRPCError({
    //       code: "BAD_REQUEST",
    //       message: "Phone number is already in use.",
    //     });
    // }

    return splitdb.$transaction(async (db) => {
      const hashedPassword = await hash(password, 10);
      const newUser = await db.user.create({
        data: {
          name: displayName,
          email: email.toLowerCase(),
          hashedPassword,
          firstName,
          lastName,
          phone,
        },
      });
      if (!newUser)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user.",
        });

      return {
        toastTitle: "Account created",
        toastDescription:
          "Welcome to FSplit! Start splitting bills with friends.",
      };
    });
  });

export const editProfile = privateProcedure
  .input(
    z.object({
      displayName: z
        .string()
        .min(2, { message: "Display name must be at least 2 characters long." })
        .max(20, {
          message: "Display name cannot be longer than 20 characters.",
        }),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { displayName, firstName, lastName, phone } = input;

    const enabledUserAccount = await splitdb.user.findUnique({
      where: {
        id: user.id,
        disabled: false,
      },
    });
    if (!enabledUserAccount)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to edit this profile.",
      });

    const existingPhoneNumber = await splitdb.user.findFirst({
      where: { phone },
    });
    if (!!existingPhoneNumber && existingPhoneNumber.id !== user.id)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Phone number is already in use.",
      });

    return splitdb.$transaction(async (db) => {
      const existingUser = await db.user.findUnique({
        where: { id: user.id },
      });
      if (!existingUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });

      const updatedUser = await db.user.update({
        where: { id: existingUser.id },
        data: {
          name: displayName,
          firstName,
          lastName,
          phone,
        },
      });
      if (!updatedUser)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile.",
        });

      if (existingUser?.name !== updatedUser.name) {
        const log = await db.log.create({
          data: {
            userId: user.id,
            type: "USER",
            message: `You changed your display name from "${existingUser.name}" to "${updatedUser.name}".`,
          },
        });
        if (!log) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to updated name log. Profile update failed.",
          });
        }
      }
      if (!!updatedUser.phone && existingUser?.phone !== updatedUser.phone) {
        const log = await db.log.create({
          data: {
            userId: user.id,
            type: "USER",
            message: `You changed your phone number from "${existingUser.phone}" to "${updatedUser.phone}".`,
          },
        });
        if (!log) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to updated phone log. Profile update failed.",
          });
        }
      }
      if (!!updatedUser.image && existingUser?.image !== updatedUser.image) {
        const log = await db.log.create({
          data: {
            userId: user.id,
            type: "USER",
            message: `You changed your profile picture.`,
          },
        });
        if (!log) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to updated image log. Profile update failed.",
          });
        }
      }
      if (existingUser?.email !== updatedUser.email) {
        const log = await db.log.create({
          data: {
            userId: user.id,
            type: "USER",
            message: `You changed your email from "${existingUser.email}" to "${updatedUser.email}".`,
          },
        });
        if (!log) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to updated email log. Profile update failed.",
          });
        }
      }
      if (existingUser?.disabled !== updatedUser.disabled) {
        const log = await db.log.create({
          data: {
            userId: user.id,
            type: "USER",
            message: `You changed your account status to ${updatedUser.disabled ? "disabled" : "enabled"}.`,
          },
        });
        if (!log) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Failed to updated account status log. Profile update failed.",
          });
        }
      }
      if (
        !!updatedUser.lastName &&
        existingUser?.lastName !== updatedUser.lastName
      ) {
        const log = await db.log.create({
          data: {
            userId: user.id,
            type: "USER",
            message: `You changed your last name from "${existingUser.lastName}" to "${updatedUser.lastName}".`,
          },
        });
        if (!log) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to updated last name log. Profile update failed.",
          });
        }
      }
      if (
        !!updatedUser.firstName &&
        existingUser?.firstName !== updatedUser.firstName
      ) {
        const log = await db.log.create({
          data: {
            userId: user.id,
            type: "USER",
            message: `You changed your first name from "${existingUser.firstName}" to "${updatedUser.firstName}".`,
          },
        });
        if (!log) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to updated first name log. Profile update failed.",
          });
        }
      }

      return {
        toastTitle: "Profile updated",
        toastDescription: "Your profile has been successfully updated.",
      };
    });
  });

export const sendFriendRequest = privateProcedure
  .input(z.string().min(1, { message: "Requested ID is required" }))
  .mutation(async ({ ctx, input: requestedId }) => {
    const { user } = ctx;
    if (user.id === requestedId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You cannot send a friend request to yourself.",
      });

    const existingUser = await splitdb.user.findUnique({
      where: { id: requestedId },
    });
    if (!existingUser)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User with that email does not exist.",
      });

    const existingFriend = await splitdb.friend.findFirst({
      where: {
        OR: [
          {
            user1Id: user.id,
            user2: { id: requestedId },
          },
          {
            user1: { id: requestedId },
            user2Id: user.id,
          },
        ],
      },
    });
    if (!!existingFriend)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is already your friend.",
      });

    const existingFriendRequest = await splitdb.friendRequest.findFirst({
      where: {
        OR: [
          {
            fromId: user.id,
            toId: existingUser.id,
          },
          {
            fromId: existingUser.id,
            toId: user.id,
          },
        ],
      },
    });
    if (!!existingFriendRequest)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Friend request already already exists.",
      });

    return splitdb.$transaction(async (db) => {
      const friendRequest = await db.friendRequest.create({
        data: {
          fromId: user.id,
          toId: existingUser.id,
        },
        include: {
          to: {
            select: {
              name: true,
            },
          },
        },
      });
      if (!friendRequest)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send friend request.",
        });

      const sentFriendRequestLog = await db.log.create({
        data: {
          userId: user.id,
          type: "USER",
          message: `Sent friend request to ${friendRequest.to.name}.`,
        },
      });
      if (!sentFriendRequestLog) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create log. Friend request failed.",
        });
      }
      const receivedFriendRequestLog = await db.log.create({
        data: {
          userId: existingUser.id,
          type: "USER",
          message: `Received friend request from ${user.name}.`,
        },
      });
      if (!receivedFriendRequestLog) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create log. Friend request failed.",
        });
      }

      return {
        toastTitle: "Friend request sent",
        toastDescription: `Friend request has been sent to ${friendRequest.to.name}.`,
      };
    });
  });

export const getFriendRequests = privateProcedure.query(async ({ ctx }) => {
  const { user } = ctx;
  const sentFriendRequests = await splitdb.friendRequest.findMany({
    where: { fromId: user.id },
    include: { to: true },
    orderBy: { createdAt: "desc" },
  });
  const receivedFriendRequests = await splitdb.friendRequest.findMany({
    where: { toId: user.id },
    include: { from: true },
    orderBy: { createdAt: "desc" },
  });
  return {
    sentFriendRequests,
    receivedFriendRequests,
  };
});

export const declineFriendRequest = privateProcedure
  .input(
    z.object({
      requestId: z
        .string()
        .min(1, { message: "Friend request ID cannot be empty" }),
      fromId: z.string().min(1, { message: "Friend ID cannot be empty" }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { requestId, fromId } = input;

    const friendRequest = await splitdb.friendRequest.findUnique({
      where: {
        id: requestId,
        fromId,
        toId: user.id,
      },
    });
    if (!friendRequest)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Friend request not found.",
      });
    if (friendRequest.toId !== user.id && friendRequest.fromId !== user.id)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to decline this friend request.",
      });

    return splitdb.$transaction(async (db) => {
      const deletedFriendRequest = await db.friendRequest.delete({
        where: { id: friendRequest.id },
        include: {
          from: {
            select: { name: true },
          },
        },
      });
      if (!deletedFriendRequest)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete friend request.",
        });

      const log = await db.log.create({
        data: {
          userId: user.id,
          type: "USER",
          message: `You declined friend request from ${deletedFriendRequest.from.name}.`,
        },
      });
      if (!log)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create log. Couldn't decline friend request.",
        });

      return {
        toastTitle: "Friend request removed",
        toastDescription: "Friend request has been successfully deleted.",
      };
    });
  });

export const acceptFriendRequest = privateProcedure
  .input(
    z.object({
      requestId: z
        .string()
        .min(1, { message: "Friend request ID cannot be empty" }),
      fromId: z.string().min(1, { message: "Friend ID cannot be empty" }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { requestId, fromId } = input;

    const friendRequest = await splitdb.friendRequest.findUnique({
      where: {
        id: requestId,
        fromId,
        toId: user.id,
      },
    });
    if (!friendRequest)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Friend request not found.",
      });
    if (friendRequest.toId !== user.id && friendRequest.fromId !== user.id)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to accept this friend request.",
      });

    return splitdb.$transaction(async (db) => {
      const friend = await db.friend.create({
        data: {
          user1Id: friendRequest.fromId,
          user2Id: friendRequest.toId,
        },
        include: {
          user1: {
            select: {
              id: true,
              name: true,
            },
          },
          user2: {
            select: { name: true },
          },
        },
      });
      if (!friend)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create friend.",
        });

      const deletedFriendRequest = await db.friendRequest.delete({
        where: { id: requestId },
      });
      if (!deletedFriendRequest)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete friend request.",
        });

      const receivedLog = await db.log.create({
        data: {
          userId: user.id,
          type: "USER",
          message: `You and ${friend.user1.name} became friends.`,
        },
      });
      if (!receivedLog)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create log. Couldn't accept friend request.",
        });
      const sentLog = await db.log.create({
        data: {
          userId: friend.user1.id,
          type: "USER",
          message: `You and ${friend.user2.name} became friends.`,
        },
      });
      if (!sentLog)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create log. Couldn't accept friend request.",
        });

      return {
        toastTitle: "Friend request has been accepted.",
        toastDescription: `${friend.user1.name} and ${friend.user2.name} are now friends`,
      };
    });
  });

export const getFriends = privateProcedure.query(async ({ ctx }) => {
  const { user } = ctx;
  const friends = await splitdb.friend.findMany({
    where: {
      OR: [{ user1Id: user.id }, { user2Id: user.id }],
    },
    include: {
      user1: true,
      user2: true,
    },
  });
  const formattedFriends = friends
    .map((friend) => (friend.user1Id === user.id ? friend.user2 : friend.user1))
    .sort((a, b) => {
      if (!!a.name && !!b.name) return a.name.localeCompare(b.name);
      return 0;
    });

  const tempFriends = await splitdb.tempFriend.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return {
    friends: !!formattedFriends.length ? formattedFriends : [],
    tempFriends: !!tempFriends.length ? tempFriends : [],
  };
});

export const getGrossBalance = privateProcedure.query(async ({ ctx }) => {
  const { user } = ctx;

  try {
    const debts = await splitdb.simplifiedDebt.findMany({
      where: {
        from: { userId: user.id },
      },
      include: { group: true },
    });
    const credits = await splitdb.simplifiedDebt.findMany({
      where: {
        to: { userId: user.id },
      },
      include: { group: true },
    });
    const debtAmount = debts.reduce((acc, debt) => acc + debt.amount, 0);
    const creditAmount = credits.reduce(
      (acc, credit) => acc + credit.amount,
      0,
    );
    return creditAmount - debtAmount;
  } catch (err) {
    console.error(err);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get gross balance.",
    });
  }
});

export const getDebtWithFriend = privateProcedure
  .input(z.string().min(1, { message: "Friend ID cannot be empty" }))
  .query(async ({ ctx, input: friendId }) => {
    const { user } = ctx;

    try {
      const existingFriend = await splitdb.user.findUnique({
        where: { id: friendId },
      });
      if (!existingFriend)
        return {
          isInDebt: false,
          displayAmountText: null,
          amount: 0,
        };

      const credits = await splitdb.simplifiedDebt.findMany({
        where: {
          from: { userId: existingFriend.id },
          to: { userId: user.id },
        },
      });
      const debts = await splitdb.simplifiedDebt.findMany({
        where: {
          from: { userId: user.id },
          to: { userId: existingFriend.id },
        },
      });

      const creditAmount = credits.reduce(
        (acc, credit) => acc + credit.amount,
        0,
      );
      const debtAmount = debts.reduce((acc, debt) => acc + debt.amount, 0);
      const balanceAmount = creditAmount - debtAmount;

      const isInDebt = debtAmount > creditAmount;
      const displayAmountText =
        balanceAmount > 0
          ? (balanceAmount / 100).toLocaleString()
          : ((balanceAmount / 100) * -1).toLocaleString();

      return {
        isInDebt,
        displayAmountText,
        amount: balanceAmount,
      };
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get debt with friend.",
      });
    }
  });

export const findFriends = privateProcedure
  .input(z.string().min(1, { message: "Search query cannot be empty" }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const searchTerm = input.toLowerCase();

    const friends = await splitdb.friend.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
      include: {
        user1: true,
        user2: true,
      },
    });
    const formattedFriends = friends
      .map((friend) =>
        friend.user1Id === user.id ? friend.user2 : friend.user1,
      )
      .sort((a, b) => {
        if (!!a.name && !!b.name) return a.name.localeCompare(b.name);
        return 0;
      });

    const tempFriends = await splitdb.tempFriend.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });

    const friendsSearchResults = formattedFriends.filter(
      (friend) =>
        friend.name?.toLowerCase().includes(searchTerm) ||
        friend.email?.toLowerCase().includes(searchTerm) ||
        friend.phone?.includes(searchTerm),
    );
    const tempFriendsSearchResults = tempFriends.filter(
      (friend) =>
        friend.name?.toLowerCase().includes(searchTerm) ||
        friend.email?.toLowerCase().includes(searchTerm) ||
        friend.phone?.includes(searchTerm),
    );

    return {
      friends: !!friendsSearchResults.length ? friendsSearchResults : [],
      tempFriends: !!tempFriendsSearchResults.length
        ? tempFriendsSearchResults
        : [],
    };
  });

export const findUsers = privateProcedure
  .input(z.string().min(1, { message: "Search query cannot be empty" }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const searchTerm = input.toLowerCase();

    const users = await splitdb.user.findMany({
      where: {
        id: { not: user.id },
        OR: [
          {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          { name: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        friends1: {
          select: { id: true },
        },
        friends2: {
          select: { id: true },
        },
      },
    });

    const friendIds = await splitdb.friend.findMany({
      where: {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
      select: { user1Id: true, user2Id: true },
    });

    const filteredUsers = users
      .map((user) => {
        const isFriend = friendIds.some(
          (friendId) =>
            user.id === friendId.user1Id || user.id === friendId.user2Id,
        );
        if (isFriend) return;
        return user;
      })
      .filter(Boolean);

    return filteredUsers || [];
  });
