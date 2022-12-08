import type { Prisma, User as PrismaUser } from '@prisma/client'
export type User = PrismaUser
export type CreateUserInputDto = Prisma.UserUncheckedCreateInput
