import {
  PrismaClient,
  SimplifiedDebt as SimplifiedDebtPrisma,
  GroupMember as GroupMemberPrisma,
  User as UserPrisma,
  CurrencyCode as CurrencyCodePrisma,
  GroupRole as GroupRolePrisma,
  GroupType as GroupTypePrisma,
  Role as RolePrisma,
} from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// TODO: Prefix all with Z to mark them as Zod native enum
export const ZCurrencyCode = CurrencyCodePrisma;
export const GroupRole = GroupRolePrisma;
export const GroupType = GroupTypePrisma;
export const Role = RolePrisma;

export type SimplifiedDebt = SimplifiedDebtPrisma;
export type CurrencyCode = CurrencyCodePrisma;
export type GroupMember = GroupMemberPrisma;
export type User = UserPrisma;
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
