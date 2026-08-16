import { Box, ButtonBase, Typography } from '@mui/material'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './RecruiterSidebar.module.css'

import dashboardIcon    from '@/assets/recruiter/speed-up-line.svg'
import mandatesIcon     from '@/assets/recruiter/Menu Icons-1.svg'
import settingsIcon     from '@/assets/recruiter/Menu Icons.svg'
import crmIcon          from '@/assets/recruiter/person.svg'
import helpIcon         from '@/assets/recruiter/customer-service-line.svg'
import profileIcon      from '@/assets/recruiter/account-circle-2-fill.svg'
import logoBanner       from '@/assets/recruiter/Group 45 (1).svg'

// ── Types ──────────────────────────────────────────────────────────────

type NavItem = {
  id: string
  label: string
  to?: string
  icon: React.ReactNode
  onClick?: () => void
}

// ── Component ──────────────────────────────────────────────────────────

export const RecruiterSidebar = () => {
  const location = useLocation()

  const navigate = useNavigate()
  const handleNewJobPostClick = () => {
    navigate(ROUTE_PATHS.recruiterNewJobPost)
  }

  const handleSettingsClick = () => {
    // TODO: Navigate to settings page
  }

  const handleHelpClick = () => {
    // TODO: Open help panel
  }

  /** Plain plus sign — New Job Post (no dedicated asset) */
  const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  /** Two overlapping person silhouettes — Candidates (no dedicated asset) */
  const CandidatesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 17c0-2.21-1.343-4-3-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )

  const mainNavItems: NavItem[] = [
    { id: 'dashboard',  label: 'Dashboard',   to: ROUTE_PATHS.recruiter, icon: <img src={dashboardIcon} width={20} height={20} alt="" aria-hidden="true" /> },
    { id: 'jobPosts',   label: 'Job Posts',   to: ROUTE_PATHS.recruiterJobPosts, icon: <img src={mandatesIcon}  width={20} height={20} alt="" aria-hidden="true" /> },
    { id: 'newJobPost', label: 'New Job Post', icon: <PlusIcon />,       onClick: handleNewJobPostClick },
    { id: 'candidates', label: 'Candidates',  to: ROUTE_PATHS.recruiterCandidates, icon: <CandidatesIcon /> },
    { id: 'crm',        label: 'CRM',         to: ROUTE_PATHS.recruiterCrm, icon: <img src={crmIcon}      width={20} height={20} alt="" aria-hidden="true" /> },
  ]

  const adminNavItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: <img src={settingsIcon} width={20} height={20} alt="" aria-hidden="true" />, onClick: handleSettingsClick },
    { id: 'profile',  label: 'Profile',  to: ROUTE_PATHS.profile, icon: <img src={profileIcon} width={20} height={20} alt="" aria-hidden="true" /> },
    { id: 'help',     label: 'Help',     icon: <img src={helpIcon}    width={20} height={20} alt="" aria-hidden="true" />, onClick: handleHelpClick },
  ]

  const renderNavItem = (item: NavItem) => {
    const isActive = item.to ? location.pathname === item.to : false

    const content = (
      <>
        <Box className={styles.navItemIcon}>{item.icon}</Box>
        <Typography component="span" className={styles.navItemLabel}>
          {item.label}
        </Typography>
      </>
    )

    if (item.to) {
      return (
        <Box
          key={item.id}
          component={NavLink}
          to={item.to}
          className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        >
          {content}
        </Box>
      )
    }

    return (
      <ButtonBase
        key={item.id}
        className={styles.navItem}
        onClick={item.onClick}
        disableRipple
      >
        {content}
      </ButtonBase>
    )
  }

  return (
    <Box component="nav" className={styles.sidebar} aria-label="Recruiter navigation">

      {/* ── Logo ── */}
      <Box className={styles.logoWrap}>
        <Box
          component={NavLink}
          to={ROUTE_PATHS.recruiter}
          aria-label="Go to Recruiter Dashboard"
          className={styles.logoLink}
        >
          <img src={logoBanner} alt="The Skills Mine — Cultivating Growth" className={styles.logoBanner} />
        </Box>
      </Box>

      {/* ── Dashboard (above MANAGE label) ── */}
      <Box className={styles.dashboardItem}>
        {renderNavItem(mainNavItems[0])}
      </Box>

      {/* ── MANAGE section ── */}
      <Box className={styles.navSection}>
        <Typography component="p" className={styles.navSectionLabel}>
          MANAGE
        </Typography>
        <Box className={styles.navList}>
          {mainNavItems.slice(1).map(renderNavItem)}
        </Box>
      </Box>

      {/* ── ADMIN section (pushed to bottom) ── */}
      <Box className={`${styles.navSection} ${styles.adminSection}`}>
        <Typography component="p" className={styles.navSectionLabel}>
          ADMIN
        </Typography>
        <Box className={styles.navList}>
          {adminNavItems.map(renderNavItem)}
        </Box>
      </Box>

    </Box>
  )
}
