import {
  PrismaClient,
  AccountVerification as AccountVerificationPrisma,
  SimplifiedDebt as SimplifiedDebtPrisma,
  CurrencyCode as CurrencyCodePrisma,
  GroupMember as GroupMemberPrisma,
  GroupRole as GroupRolePrisma,
  GroupType as GroupTypePrisma,
  Role as RolePrisma,
  User as UserPrisma,
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
export const ZGroupRole = GroupRolePrisma;
export const ZGroupType = GroupTypePrisma;
export const ZRole = RolePrisma;

// TODO: Prefix all with T to mark prisma types.
export type TAccountVerification = AccountVerificationPrisma;
export type SimplifiedDebt = SimplifiedDebtPrisma;
export type CurrencyCode = CurrencyCodePrisma;
export type GroupMember = GroupMemberPrisma;
export type TGroupRole = GroupRolePrisma;
export type TUserRole = RolePrisma;
export type User = UserPrisma;
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
