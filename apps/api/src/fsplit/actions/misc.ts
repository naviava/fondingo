import { publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import splitdb from "@fondingo/db-split";
import { z } from "@fondingo/utils/zod";

export const contactUs = publicProcedure
  .input(
    z.object({
      fullName: z
        .string()
        .min(1, { message: "Cannot be empty" })
        .max(50, { message: "Too long" }),
      email: z.string().email({ message: "Invalid email address" }),
      message: z
        .string()
        .min(10, { message: "Too short" })
        .max(5000, { message: "Too long" }),
    }),
  )
  .mutation(async ({ input }) => {
    const email = input.email.toLowerCase();
    const { fullName, message } = input;

    const sentMessage = await splitdb.contactForm.create({
      data: {
        name: fullName,
        email,
        message,
      },
    });
    if (!sentMessage)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send message",
      });

    return {
      toastTitle: "Message sent",
      toastDescription: "We'll get back to you soon!",
    };
  });
