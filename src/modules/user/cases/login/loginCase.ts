import { Either, left, right } from 'fp-ts/lib/Either'
import argon2 from 'argon2'

import userService from '@user/services/user/userService'
import { User } from '@user/models/user'
import { LoginError } from './loginError'
import { LoginDTO } from './loginDTO'

export const login = async ({
  login,
  password
}: LoginDTO): Promise<Either<LoginError, User>> => {
  // It only evaluates the first one if it finds it.
  const user =
    (await userService.findByEmail(login)) ||
    (await userService.findByUsername(login))

  if (!user) return left({ kind: 'AccountNotExists' })

  if (!(await argon2.verify(user.password, password))) {
    return left({ kind: 'IncorrectPassword' })
  }

  return right(user)
}
