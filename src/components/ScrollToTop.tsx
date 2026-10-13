import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// React Router (BrowserRouter) does not reset scroll on navigation; the browser keeps the old offset.
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    if (hash || navigationType === 'POP') {
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash, navigationType])

  return null
}
