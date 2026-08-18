import { useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import styles from './RecruiterMancoPage.module.css'

// ── Types ──────────────────────────────────────────────────────────────

type SortKey = 'mtdPlacements' | 'activeRoles' | 'totalCandidates' | 'conversionRate' | 'alphabetical'

type Recruiter = {
  id: string
  name: string
  role: string
  department: string
  mtdPlacements: number
  activeRoles: number
  candidates: number
  conversionPct: number
}

// ── Mock Data ──────────────────────────────────────────────────────────

const RECRUITERS: Recruiter[] = [
  {
    id: '1',
    name: 'Michael Smith',
    role: 'Recruitment Manager',
    department: 'Engineering and Technology',
    mtdPlacements: 7,
    activeRoles: 12,
    candidates: 53,
    conversionPct: 13,
  },
  {
    id: '2',
    name: 'Michael Smith',
    role: 'Recruitment Manager',
    department: 'Engineering and Technology',
    mtdPlacements: 5,
    activeRoles: 9,
    candidates: 41,
    conversionPct: 12,
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    role: 'Senior Recruiter',
    department: 'Finance and Accounting',
    mtdPlacements: 4,
    activeRoles: 8,
    candidates: 37,
    conversionPct: 11,
  },
  {
    id: '4',
    name: 'David Williams',
    role: 'Recruiter',
    department: 'Sales and Marketing',
    mtdPlacements: 3,
    activeRoles: 6,
    candidates: 28,
    conversionPct: 11,
  },
]

// ── Inline SVG Icons ───────────────────────────────────────────────────

const AlertCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
  </svg>
)

const ChevronDownIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const TeamIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M2 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M20 17c0-2.21-1.343-4-3-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ── Sort Labels ────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'mtdPlacements',   label: 'MTD Placements' },
  { key: 'activeRoles',     label: 'Active Roles' },
  { key: 'totalCandidates', label: 'Total Candidates' },
  { key: 'conversionRate',  label: 'Conversion Rate' },
  { key: 'alphabetical',    label: 'Alphabetical' },
]

// ── Helpers ────────────────────────────────────────────────────────────

function sortRecruiters(recruiters: Recruiter[], key: SortKey): Recruiter[] {
  const sorted = [...recruiters]
  switch (key) {
    case 'mtdPlacements':   return sorted.sort((a, b) => b.mtdPlacements - a.mtdPlacements)
    case 'activeRoles':     return sorted.sort((a, b) => b.activeRoles - a.activeRoles)
    case 'totalCandidates': return sorted.sort((a, b) => b.candidates - a.candidates)
    case 'conversionRate':  return sorted.sort((a, b) => b.conversionPct - a.conversionPct)
    case 'alphabetical':    return sorted.sort((a, b) => a.name.localeCompare(b.name))
    default:                return sorted
  }
}

// ── Sub-components ─────────────────────────────────────────────────────

type EmployeeCardProps = {
  recruiter: Recruiter
  onViewDetails: (id: string) => void
}

const EmployeeCard = ({ recruiter, onViewDetails }: EmployeeCardProps) => {
  const [pipelineOpen, setPipelineOpen] = useState(false)

  return (
    <Box className={styles.employeeCard}>
      {/* Top row: name/role + button */}
      <Box className={styles.employeeCardTopRow}>
        <Box>
          <Typography component="h3" className={styles.employeeName}>
            {recruiter.name}
          </Typography>
          <Typography component="p" className={styles.employeeMeta}>
            <span className={styles.employeeRole}>{recruiter.role}</span>
            <span className={styles.employeeMetaDivider}>|</span>
            <span className={styles.employeeDept}>{recruiter.department}</span>
          </Typography>
        </Box>
        <ButtonBase
          className={styles.viewDetailsBtn}
          onClick={() => onViewDetails(recruiter.id)}
          disableRipple
        >
          View Details
        </ButtonBase>
      </Box>

      {/* Stats row */}
      <Box className={styles.statsRow}>
        <Box className={styles.statCell}>
          <Typography component="p" className={styles.statCellLabel}>MTD Placements</Typography>
          <Typography component="p" className={styles.statCellValue}>{recruiter.mtdPlacements}</Typography>
        </Box>
        <Box className={styles.statCell}>
          <Typography component="p" className={styles.statCellLabel}>Active Roles</Typography>
          <Typography component="p" className={styles.statCellValue}>{recruiter.activeRoles}</Typography>
        </Box>
        <Box className={styles.statCell}>
          <Typography component="p" className={styles.statCellLabel}>Candidates</Typography>
          <Typography component="p" className={styles.statCellValue}>{recruiter.candidates}</Typography>
        </Box>
        <Box className={styles.statCell}>
          <Typography component="p" className={styles.statCellLabel}>Conversion</Typography>
          <Typography component="p" className={styles.statCellValue}>{recruiter.conversionPct}%</Typography>
        </Box>
      </Box>

      {/* Divider */}
      <Box className={styles.cardDivider} />

      {/* Pipeline distribution toggle */}
      <ButtonBase
        className={styles.pipelineRow}
        onClick={() => setPipelineOpen((prev) => !prev)}
        disableRipple
        component="div"
      >
        <Typography component="p" className={styles.pipelineRowLabel}>
          Pipeline distribution
        </Typography>
        <Box
          className={styles.pipelineChevron}
          sx={{ transform: pipelineOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
        >
          <ChevronDownIcon size={20} />
        </Box>
      </ButtonBase>
    </Box>
  )
}

// ── Page Component ─────────────────────────────────────────────────────

const RecruiterMancoPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSort, setActiveSort] = useState<SortKey>('mtdPlacements')

  const recruitersRequiringAttention = 3

  const handleViewDetails = (_id: string) => {
    // TODO: navigate to recruiter detail
  }

  const filtered = RECRUITERS.filter((r) => {
    const q = searchQuery.toLowerCase()
    return (
      r.name.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q)
    )
  })

  const sorted = sortRecruiters(filtered, activeSort)

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />

      <Box className={styles.pageRoot}>
        {/* ── Page Header ── */}
        <Typography component="h1" className={styles.pageTitle}>
          MANCO Dashboard
        </Typography>
        <Typography component="p" className={styles.pageSubtitle}>
          Recruitment team performance metrics and pipeline overview
        </Typography>

        {/* ── Top Banner ── */}
        <Box className={styles.topBanner}>
          {/* Alert Card */}
          <Box className={styles.alertCard}>
            <Box className={styles.alertCardTopRow}>
              <Typography component="p" className={styles.alertCardValue}>
                {recruitersRequiringAttention}
              </Typography>
              <Box className={styles.alertCardActions}>
                <Box className={styles.alertCardIconBtn} aria-label="Info">
                  <AlertCircleIcon />
                </Box>
                <Box className={styles.alertCardIconBtn} aria-label="Expand">
                  <ChevronDownIcon size={22} />
                </Box>
              </Box>
            </Box>
            <Typography component="p" className={styles.alertCardLabel}>
              Recruiters requiring attention
            </Typography>
          </Box>

          {/* CRM Integration Card */}
          <Box className={styles.crmCard}>
            <Typography component="p" className={styles.crmCardLabel}>
              CRM Integration
            </Typography>
            <Box className={styles.crmCardIcon}>
              <TeamIcon />
            </Box>
          </Box>
        </Box>

        {/* ── Search Employees ── */}
        <Box className={styles.searchSection}>
          <Typography component="h2" className={styles.searchSectionTitle}>
            Search Employees
          </Typography>

          <Box className={styles.searchInputWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name, position or department"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search employees"
            />
            <Box className={styles.searchInputIcon}>
              <SearchIcon />
            </Box>
          </Box>

          {/* Sort Bar */}
          <Box className={styles.sortBar}>
            <Typography component="span" className={styles.sortLabel}>Sort</Typography>
            {SORT_OPTIONS.map((opt) => (
              <ButtonBase
                key={opt.key}
                component="button"
                className={`${styles.sortBtn} ${activeSort === opt.key ? styles.sortBtnActive : ''}`}
                onClick={() => setActiveSort(opt.key)}
                disableRipple
              >
                {opt.label}
                <Box className={styles.sortChevron}>
                  <ChevronDownIcon size={13} />
                </Box>
              </ButtonBase>
            ))}
          </Box>
        </Box>

        {/* ── Employee Cards ── */}
        {sorted.map((recruiter) => (
          <EmployeeCard
            key={recruiter.id}
            recruiter={recruiter}
            onViewDetails={handleViewDetails}
          />
        ))}
      </Box>
    </Box>
  )
}

export default RecruiterMancoPage
