import { Box, ButtonBase, Typography } from '@mui/material'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { useAuth } from '@/app/auth/AuthContext'
import { beginLogoutNavigation } from '@/app/auth/logoutNavigation'
import { authApi } from '@/services/api/authApi'
import styles from './RecruiterSidebar.module.css'

import gridOnIcon       from '@/assets/recruiter/grid_on.svg'
import mandatesIcon     from '@/assets/recruiter/Menu Icons-1.svg'
import crmIcon          from '@/assets/recruiter/person.svg'
import mancoIcon        from '@/assets/recruiter/settings_account_box.svg'
import logoutIcon       from '@/assets/logout-icon.svg'
import logoBanner       from '@/assets/recruiter/Group 45 (1).svg'
import excoDashboardIcon from '@/assets/recruiter/speed-up-line.svg'
import excoLogo from '@/assets/exco/logo.svg'
import excoLogoutIcon from '@/assets/exco/logout.svg'

// ── Types ──────────────────────────────────────────────────────────────

type NavItem = {
  id: string
  label: string
  to?: string
  icon: React.ReactNode
  onClick?: () => void
}

// ── Icons (declared outside component to avoid re-creation on render) ──

/** Plain plus sign — New Job Post (no dedicated asset) */
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/** Two overlapping person silhouettes — Candidates (no dedicated asset) */
const CandidatesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M2 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M20 17c0-2.21-1.343-4-3-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

/** Megaphone — Advertised Jobs (no dedicated asset) */
const AdvertisedJobsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 10v4a1 1 0 0 0 1 1h3l8 4V5L7 9H4a1 1 0 0 0-1 1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M18.5 9.5a4 4 0 0 1 0 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7 15l1.5 5h2.5l-1-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
)

// ── Component ──────────────────────────────────────────────────────────

export const RecruiterSidebar = ({ variant = 'recruiter' }: { variant?: 'recruiter' | 'exco' }) => {
  const isExco = variant === 'exco'
  const dashboardPath = isExco ? ROUTE_PATHS.exco : ROUTE_PATHS.recruiterDashboard
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const handleNewJobPostClick = () => {
    navigate(ROUTE_PATHS.recruiterNewJobPost)
  }

  const handleLogoutClick = async () => {
    try {
      await authApi.logout()
    } catch {
      // proceed with local session teardown even if the server call fails
    }
    beginLogoutNavigation()
    logout()
    window.location.replace(ROUTE_PATHS.landing)
  }

  const mainNavItems: NavItem[] = isExco ? [
    { id: 'dashboard', label: 'Dashboard', to: dashboardPath, icon: <img src={excoDashboardIcon} alt="" aria-hidden="true" /> },
    { id: 'crm', label: 'CRM', to: ROUTE_PATHS.excoCrm, icon: <img src={crmIcon} alt="" aria-hidden="true" /> },
  ] : [
    { id: 'pipeline',  label: 'Pipeline',   to: ROUTE_PATHS.recruiterDashboard, icon: <img src={gridOnIcon} width={18} height={18} alt="" aria-hidden="true" /> },
    { id: 'jobPosts',   label: 'Job Posts',   to: ROUTE_PATHS.recruiterJobPosts, icon: <img src={mandatesIcon}  width={18} height={18} alt="" aria-hidden="true" /> },
    { id: 'newJobPost', label: 'New Job Post', icon: <PlusIcon />,       onClick: handleNewJobPostClick },
    { id: 'advertisedJobs', label: 'Advertised Jobs', to: ROUTE_PATHS.recruiterAdvertisedJobs, icon: <AdvertisedJobsIcon /> },
    { id: 'candidates', label: 'Candidates',  to: ROUTE_PATHS.recruiterCandidates, icon: <CandidatesIcon /> },
    { id: 'crm',        label: 'CRM',         to: ROUTE_PATHS.recruiterCrm, icon: <img src={crmIcon}      width={18} height={18} alt="" aria-hidden="true" /> },
    { id: 'manco',      label: 'MANCO',       to: ROUTE_PATHS.recruiterManco, icon: <img src={mancoIcon} width={18} height={18} alt="" aria-hidden="true" /> },
  ]

  const adminNavItems: NavItem[] = [
    { id: 'logout', label: 'Log Out', icon: <img src={isExco ? excoLogoutIcon : logoutIcon} width={isExco ? 24 : 18} height={isExco ? 24 : 18} alt="" aria-hidden="true" />, onClick: handleLogoutClick },
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
          end={isExco}
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
    <Box component="nav" className={`${styles.sidebar} ${isExco ? styles.excoSidebar : ''}`} aria-label={isExco ? 'EXCO navigation' : 'Recruiter navigation'} data-tour={isExco ? undefined : 'recruiter-sidebar'}>

      {/* ── Logo ── */}
      <Box className={styles.logoWrap}>
        <Box
          component={NavLink}
          to={dashboardPath}
          end={isExco}
          aria-label={isExco ? 'Go to EXCO Dashboard' : 'Go to Recruiter Dashboard'}
          className={styles.logoLink}
        >
          <img src={isExco ? excoLogo : logoBanner} alt="The Skills Mine — Cultivating Growth" className={styles.logoBanner} />
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

      {/* ── ADMIN section ── */}
      <Box className={styles.navSection}>
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
