export type DataErrorType<T> =
  | [data: T, error: undefined]
  | [data: undefined, error: string];
