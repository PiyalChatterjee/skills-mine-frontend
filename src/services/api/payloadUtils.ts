export const omitEmptyValues = <T extends object>(input: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ) as Partial<T>;
