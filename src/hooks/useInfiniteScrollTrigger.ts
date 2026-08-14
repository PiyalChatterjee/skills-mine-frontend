import { useEffect, useRef } from 'react'

type UseInfiniteScrollTriggerOptions = {
  enabled?: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isError: boolean
  itemCount: number
  onLoadMore: () => void | Promise<void>
  rootMargin?: string
  threshold?: number
}

export const useInfiniteScrollTrigger = ({
  enabled = true,
  hasNextPage,
  isFetchingNextPage,
  isError,
  itemCount,
  onLoadMore,
  rootMargin = '240px 0px',
  threshold = 0,
}: UseInfiniteScrollTriggerOptions) => {
  const triggerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    if (!hasNextPage || isFetchingNextPage || isError || itemCount === 0) {
      return
    }

    const triggerNode = triggerRef.current
    if (!triggerNode) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (!entry?.isIntersecting) {
          return
        }

        void onLoadMore()
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    )

    observer.observe(triggerNode)

    return () => {
      observer.disconnect()
    }
  }, [enabled, hasNextPage, isError, isFetchingNextPage, itemCount, onLoadMore, rootMargin, threshold])

  return triggerRef
}
