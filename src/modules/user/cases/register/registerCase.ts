import argon2 from 'argon2'

import { User } from '@user/models/user'
import { RegisterError } from './registerError'
import userService, { CreateUserError } from '@user/services/user/userService'
import * as RegisterDto from './registerDTO'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { InputValidationError } from '@user/models/common'

export const register = (
  data: RegisterDto.CreateUserInputDto
): TE.TaskEither<InputValidationError | CreateUserError, User> => {
  return pipe(
    data,
    RegisterDto.validate,
    TE.bind('hashPassword', ({ password }) =>
      TE.tryCatch(() => argon2.hash(password), E.toError)
    ),
    TE.chain(({ hashPassword, email, username }) =>
      userService.createUser({ email, username, password: hashPassword })
    )
  )
}
