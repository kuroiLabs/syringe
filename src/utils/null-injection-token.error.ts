export class NullInjectionTokenError extends Error {
  constructor(_key: string) {
    super(`Null injection token for "${_key}""`)
  }
}