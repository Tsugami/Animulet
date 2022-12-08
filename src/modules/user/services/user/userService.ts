import { Prisma } from '@prisma/client'
import { UnknownError } from '@user/models/common'
import { CreateUserInputDto, User } from '@user/models/user'
import prisma from 'database'
import * as E from 'fp-ts/Either'
import { TaskEither, tryCatch } from 'fp-ts/TaskEither'

export class UniqueUserEmailError extends Error {
  static new() {
    return new UniqueUserEmailError()
  }
}

export class UniqueUsernameError extends Error {
  static new() {
    return new UniqueUsernameError()
  }
}

export type CreateUserError =
  | UniqueUserEmailError
  | UniqueUsernameError
  | UnknownError

const isUniquePrismaError = <F = string>(error: unknown, fieldName: F[]) =>
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002' &&
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  error.meta?.target?.includes(fieldName)

const createUser = (
  user: CreateUserInputDto
): TaskEither<CreateUserError, User> =>
  tryCatch(
    () => prisma.user.create({ data: user }),
    (e) => {
      if (isUniquePrismaError<keyof User>(e, ['email'])) {
        return UniqueUserEmailError.new()
      }

      if (isUniquePrismaError<keyof User>(e, ['password'])) {
        return UniqueUsernameError.new()
      }

      return UnknownError.of(E)
    }
  )

const findById = async (id: string): Promise<User | null> =>
  prisma.user.findUnique({ where: { id } })

const findByUsername = async (username: string): Promise<User | null> =>
  prisma.user.findUnique({ where: { username } })

const findByEmail = async (email: string): Promise<User | null> =>
  prisma.user.findUnique({ where: { email } })

export default { createUser, findById, findByUsername, findByEmail }
