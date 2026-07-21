export interface Option<TValue extends string = string> {
  label: string
  value: TValue
}

export type Dictionary<TValue> = Record<string, TValue>
