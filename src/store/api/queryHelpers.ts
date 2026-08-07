import { mapQueryError } from "@/app/queryErrorHandler";
import type { ApiError } from "@/types";

type QueryResult<TData> = { data: TData } | { error: ApiError };

export const withMappedApiError = async <TData>(
  operation: () => Promise<TData>,
): Promise<QueryResult<TData>> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    return { error: mapQueryError(error) };
  }
};
