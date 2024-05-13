import {
  PrismaClient,
  Role as RolePrisma,
  GroupRole as GroupRolePrisma,
  GroupType as GroupTypePrisma,
  GroupMember as GroupMemberPrisma,
  SimplifiedDebt as SimplifiedDebtPrisma,
} from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export const Role = RolePrisma;
export const GroupRole = GroupRolePrisma;
export const GroupType = GroupTypePrisma;

export type SimplifiedDebt = SimplifiedDebtPrisma;
export type GroupMember = GroupMemberPrisma;
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
