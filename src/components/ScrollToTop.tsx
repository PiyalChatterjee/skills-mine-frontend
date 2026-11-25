import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// React Router (BrowserRouter) does not reset scroll on navigation; the browser keeps the old offset.
export const ScrollToTop = () => {
  const location = useLocation()
  const { pathname, hash } = location
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    const restoreScrollY = (
      location.state as { restoreScrollY?: unknown } | null
    )?.restoreScrollY

    if (typeof restoreScrollY === 'number' && Number.isFinite(restoreScrollY)) {
      window.scrollTo({ top: restoreScrollY, left: 0, behavior: 'instant' })
      return
    }

    if (hash || navigationType === 'POP') {
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash, navigationType, location.state])

  return null
}
