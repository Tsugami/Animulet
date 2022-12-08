export class UnknownError extends Error {
  constructor(public readonly originalError: unknown) {
    super()
  }

  static of(e: unknown) {
    return new UnknownError(e)
  }
}

export class InputValidationError extends Error {
  static of(e: unknown) {
    return new InputValidationError((e as Error).message)
  }
}
