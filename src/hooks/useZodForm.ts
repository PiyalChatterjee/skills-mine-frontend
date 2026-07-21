import {
  type FieldValues,
  useForm,
  type DefaultValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'

export function useZodForm<TFieldValues extends FieldValues>(
  schema: ZodType<TFieldValues>,
  options?: Omit<UseFormProps<TFieldValues>, 'resolver'> & {
    defaultValues?: DefaultValues<TFieldValues>
  },
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    ...options,
    resolver: zodResolver(schema as never) as UseFormProps<TFieldValues>['resolver'],
  })
}
