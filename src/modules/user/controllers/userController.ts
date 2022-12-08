import { Response, Request } from 'express'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import jwt from 'jsonwebtoken'

import { register as registerUser } from '@user/cases/register/registerCase'

import { login as loginCase } from '@user/cases/login/loginCase'
import { validateLoginDTO } from '@user/cases/login/loginDTO'
import { pipe } from 'fp-ts/lib/function'
import { InputValidationError, UnknownError } from '@user/models/common'
import {
  UniqueUserEmailError,
  UniqueUsernameError
} from '@user/services/user/userService'

export const login = async (request: Request, response: Response) => {
  const dto = await validateLoginDTO(request.body)

  if (E.isLeft(dto)) {
    return response.status(400).json(dto.left)
  }

  const res = await loginCase(dto.right)

  if (E.isLeft(res)) {
    return response.status(403).json(res.left)
  }

  const privateKey: string = process.env.JWT_PRIVATE_KEY || ''
  const token = jwt.sign({ id: res.right.id }, privateKey)

  response.status(202).json({ token })
}

const generateToken = (userId: string) => {
  return E.tryCatch(() => {
    const privateKey: string = process.env.JWT_PRIVATE_KEY || ''
    const token = jwt.sign({ id: userId }, privateKey)

    return token
  }, UnknownError.of)
}

export const register = async (request: Request, response: Response) => {
  return pipe(
    request.body,
    registerUser,
    TE.chainW(({ id }) => pipe(id, generateToken, TE.fromEither)),
    TE.map((token) => response.status(201).json({ token })),
    TE.mapLeft((e) => {
      if (e instanceof InputValidationError) {
        return response.status(400).json({ error: e.message })
      }

      if (e instanceof UniqueUserEmailError) {
        return response.status(409).json({ error: e.message })
      }

      if (e instanceof UniqueUsernameError) {
        return response.status(401).json({ error: e.message })
      }
    })
  )()
}
