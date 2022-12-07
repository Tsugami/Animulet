import { Either, left, right } from 'fp-ts/lib/Either'
import argon2 from 'argon2'

import { User } from '@user/models/user'
import { RegisterError } from './registerError'
import userService from '@user/services/user/userService'
import { RegisterDTO } from './registerDTO'

export const register = async ({
  username,
  email,
  password
}: RegisterDTO): Promise<Either<RegisterError, User>> => {
  const verifyEmail = await userService.findByEmail(email)
  if (verifyEmail) return left({ kind: 'EmailAlreadyUsed' })

  const verifyUsername = await userService.findByUsername(username)
  if (verifyUsername) return left({ kind: 'UsernameAlreadyUsed' })

  const hashedPassword = await argon2.hash(password)

  const user = await userService.save({
    username,
    email,
    password: hashedPassword
  })

  return right(user)
}
