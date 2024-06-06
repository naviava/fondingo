import {
  PrismaClient,
  AccountVerification,
  SimplifiedDebt as SimplifiedDebtPrisma,
  CurrencyCode as CurrencyCodePrisma,
  GroupMember as GroupMemberPrisma,
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

// TODO: Prefix all with Z to mark them as Zod native enum.
export const ZCurrencyCode = CurrencyCodePrisma;
export const ZGroupRole = GroupRole;
export const ZGroupType = GroupType;
export const ZRole = Role;

// TODO: Prefix all with T to mark prisma types.
export type TAccountVerification = AccountVerification;
export type TConfirmEmailToken = ConfirmEmailToken;
export type SimplifiedDebt = SimplifiedDebtPrisma;
export type CurrencyCode = CurrencyCodePrisma;
export type GroupMember = GroupMemberPrisma;
export type TGroupRole = GroupRole;
export type TUserRole = Role;
export type User = UserPrisma;
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
