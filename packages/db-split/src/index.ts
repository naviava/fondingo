import {
  PrismaClient,
  AccountVerification,
  SimplifiedDebt,
  CurrencyCode,
  GroupMember,
  GroupRole,
  GroupType,
  Role,
  User as UserPrisma,
  ConfirmEmailToken,
} from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export const ZCurrencyCode = CurrencyCode;
export const ZGroupRole = GroupRole;
export const ZGroupType = GroupType;
export const ZRole = Role;

// TODO: Prefix all with T to mark prisma types.
export type TAccountVerification = AccountVerification;
export type TConfirmEmailToken = ConfirmEmailToken;
export type TSimplifiedDebt = SimplifiedDebt;
export type TCurrencyCode = CurrencyCode;
export type TGroupMember = GroupMember;
export type TGroupRole = GroupRole;
export type TUserRole = Role;
export type TUser = UserPrisma;
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
