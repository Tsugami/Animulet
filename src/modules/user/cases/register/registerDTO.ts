import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import * as yup from 'yup'

import { InputValidationError } from '@user/models/common'

export interface CreateUserInputDto {
  username: string
  email: string
  password: string
}

const schema: yup.SchemaOf<CreateUserInputDto> = yup
  .object()
  .shape({
    username: yup.string().required().max(128),
    email: yup.string().required().min(5).email().max(128),
    password: yup.string().min(8).max(128)
  })
  .defined()

export const validate = (
  input: Partial<CreateUserInputDto>
): TE.TaskEither<InputValidationError, CreateUserInputDto> =>
  TE.tryCatch(
    async () => (await schema.validate(input)) as CreateUserInputDto,
    InputValidationError.of
  )
