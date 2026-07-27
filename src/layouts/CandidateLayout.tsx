import { Box } from '@mui/material'
import type { MouseEvent } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { isJwtExpired } from '@/app/auth/jwt'
import {
  buildHeaderNavItems,
  getRoleHeaderNavKeys,
  type HeaderNavActionMap,
} from '@/layouts/headerNav'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { PublicFooter } from './components/PublicFooter'
import { PublicHeader } from './components/PublicHeader'
import styles from './CandidateLayout.module.css'

export const CandidateLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, tokens, user } = useAuth()

  const accessToken = tokens?.accessToken
  const hasValidAccessToken = accessToken ? !isJwtExpired(accessToken) : false
  const canAccessProtectedRoutes = isAuthenticated && hasValidAccessToken

  const handleHelpClick = () => {
    // TODO: Implement help action
  }

  const handleSignUpClick = () => {
    // TODO: Implement sign-up action
  }

  const handleSearchClick = () => {
    // TODO: Implement search action
  }

  const handleJobApplicationsClick = () => {
    // TODO: Implement job applications navigation
  }

  const handleSavedJobPostsClick = () => {
    // TODO: Implement saved job posts navigation
  }

  const handleCvBuilderClick = () => {
    // TODO: Implement CV builder navigation
  }

  const handleSkillsBuildClick = () => {
    // TODO: Implement skills build navigation
  }

  const handleBlogClick = () => {
    // TODO: Implement blog navigation
  }

  const handleNotificationClick = () => {
    // TODO: Implement notifications panel
  }

  const handleProtectedNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    targetPath: string,
  ) => {
    if (canAccessProtectedRoutes) {
      return
    }
    event.preventDefault()
    navigate(ROUTE_PATHS.login, { state: { from: targetPath } })
  }

  const candidateHeaderActions: HeaderNavActionMap = {
    jobApplications: handleJobApplicationsClick,
    savedJobPosts: handleSavedJobPostsClick,
    cvBuilder: handleCvBuilderClick,
    skillsBuild: handleSkillsBuildClick,
    blog: handleBlogClick,
  }

  const candidateNavItems = buildHeaderNavItems({
    keys: getRoleHeaderNavKeys(user?.role ?? 'candidate'),
    pathname: location.pathname,
    actions: candidateHeaderActions,
  })

  return (
    <Box className={styles.layoutRoot}>
      <PublicHeader
        canAccessProtectedRoutes={canAccessProtectedRoutes}
        navItems={candidateNavItems}
        onProtectedNavClick={handleProtectedNavClick}
        onHelpClick={handleHelpClick}
        onNotificationClick={handleNotificationClick}
        onSignUpClick={handleSignUpClick}
        onSearchClick={handleSearchClick}
        showHelpButton={false}
        showSignUp={false}
        showNotificationButton={true}
        showProfileBadge={true}
        showSearchButton={true}
      />

      <Box component="main" className={styles.contentArea}>
        <Outlet />
      </Box>

      <PublicFooter showContactLink={true} />
    </Box>
  )
}
