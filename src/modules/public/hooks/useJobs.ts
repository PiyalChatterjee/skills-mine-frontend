import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLazyListJobsPageQuery } from '@/store/api/apiSlice'
import type { ApiError, Job, JobsResponse } from '@/types'
import { DEFAULT_JOBS_PAGE_SIZE } from '../constants/landingPage.constants'

export type { Job, JobsResponse }

type InfiniteJobsData = {
  pages: JobsResponse[]
}

const hasMorePages = (lastPage: JobsResponse | undefined, allPages: JobsResponse[], pageSize: number) => {
  if (!lastPage) return false

  const loadedCount = allPages.reduce((total, page) => total + page.jobs.length, 0)
  const resolvedTotal = typeof lastPage.total === 'number' && lastPage.total >= 0
    ? lastPage.total
    : loadedCount
  const responsePageSize = typeof lastPage.pageSize === 'number' && lastPage.pageSize > 0
    ? lastPage.pageSize
    : pageSize

  if (lastPage.jobs.length === 0) return false
  if (resolvedTotal > 0 && loadedCount >= resolvedTotal) return false
  if (lastPage.jobs.length < responsePageSize) return false

  return true
}

export const useJobs = (
  searchQuery?: string,
  enabled = true,
  pageSize = DEFAULT_JOBS_PAGE_SIZE,
) => {
  const [triggerPage, triggerState] = useLazyListJobsPageQuery()
  const [pages, setPages] = useState<JobsResponse[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoadingInitial, setIsLoadingInitial] = useState(false)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)

  const resetPages = useCallback(() => {
    setPages([])
    setCurrentPage(0)
    setIsLoadingInitial(false)
    setIsFetchingNextPage(false)
  }, [])

  useEffect(() => {
    resetPages()

    if (!enabled) {
      return
    }

    setIsLoadingInitial(true)
    void triggerPage({ searchQuery, page: 1, pageSize }, true)
      .unwrap()
      .then((firstPage) => {
        setPages([firstPage])
        setCurrentPage(1)
      })
      .finally(() => {
        setIsLoadingInitial(false)
      })
  }, [enabled, pageSize, resetPages, searchQuery, triggerPage])

  const hasNextPage = useMemo(
    () => hasMorePages(pages[pages.length - 1], pages, pageSize),
    [pageSize, pages],
  )

  const fetchNextPage = useCallback(async () => {
    if (!enabled || !hasNextPage || isFetchingNextPage) {
      return
    }

    const nextPage = currentPage + 1
    setIsFetchingNextPage(true)

    try {
      const nextData = await triggerPage({ searchQuery, page: nextPage, pageSize }, true).unwrap()
      setPages((previous) => [...previous, nextData])
      setCurrentPage(nextPage)
    } finally {
      setIsFetchingNextPage(false)
    }
  }, [currentPage, enabled, hasNextPage, isFetchingNextPage, pageSize, searchQuery, triggerPage])

  return {
    data: { pages } as InfiniteJobsData,
    isError: triggerState.isError,
    error: (triggerState.error ?? null) as ApiError | null,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading: isLoadingInitial,
  }
}
