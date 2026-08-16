import { Box, Button, ButtonBase, CircularProgress, Popover, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { mandateApi } from '@/services/api/mandateApi'
import type { JobPost } from '@/types/api'
import styles from './MandatesScreen.module.css'

type MandatesScreenProps = {
  onNewJobPost: () => void
  onEditJobPost: (mandateId: string) => void
}

const STATUS_OPTIONS = ['Draft', 'Posted', 'Closed'] as const
type StatusOption = (typeof STATUS_OPTIONS)[number]

const LOCATION_OPTIONS = ['Johannesburg', 'Cape Town', 'Remote', 'Hybrid'] as const
type LocationOption = (typeof LOCATION_OPTIONS)[number]

/** Format ISO date string to "D Mon YYYY" e.g. "15 Oct 2024" */
function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Returns initials from the first two words of a string, e.g. "Standard Bank" → "SB" */
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Capitalise first letter, lowercase rest e.g. "POSTED" → "Posted" */
function toTitleCase(s: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export const MandatesScreen = ({ onNewJobPost, onEditJobPost }: MandatesScreenProps) => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const [anchorEl, setAnchorEl]       = useState<HTMLButtonElement | null>(null)
  const [activeRowId, setActiveRowId] = useState<string | null>(null)

  // Status filter dropdown
  const statusBtnRef = useRef<HTMLButtonElement | null>(null)
  const [statusAnchorEl, setStatusAnchorEl]     = useState<HTMLButtonElement | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<StatusOption[]>([])

  // Company filter dropdown
  const companyBtnRef = useRef<HTMLButtonElement | null>(null)
  const [companyAnchorEl, setCompanyAnchorEl]     = useState<HTMLButtonElement | null>(null)
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])

  // Search query
  const [searchQuery, setSearchQuery] = useState('')

  // Location filter dropdown
  const locationBtnRef = useRef<HTMLButtonElement | null>(null)
  const [locationAnchorEl, setLocationAnchorEl]   = useState<HTMLButtonElement | null>(null)
  const [selectedLocations, setSelectedLocations] = useState<LocationOption[]>([])

  // ── Fetch all job posts on mount ──────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    setError(null)
    mandateApi
      .getJobPosts()
      .then((envelope) => {
        setJobPosts(envelope.data ?? [])
      })
      .catch(() => {
        setError('Failed to load job posts. Please try again.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // ── Derived company options from loaded data ──────────────────────────────
  const companyOptions = useMemo(
    () => [...new Set(jobPosts.map((p) => p.client).filter(Boolean))].sort(),
    [jobPosts],
  )

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredRows = jobPosts.filter((post) => {
    const q = searchQuery.trim().toLowerCase()
    const searchMatch =
      q === '' ||
      post.title.toLowerCase().includes(q) ||
      post.client.toLowerCase().includes(q) ||
      post.location?.toLowerCase().includes(q) ||
      post.industry?.toLowerCase().includes(q)
    const statusMatch =
      selectedStatuses.length === 0 ||
      selectedStatuses.some(
        (s) => s.toUpperCase() === post.status.toUpperCase(),
      )
    const locationMatch =
      selectedLocations.length === 0 ||
      selectedLocations.some((l) =>
        post.location?.toLowerCase().includes(l.toLowerCase()),
      )
    const companyMatch =
      selectedCompanies.length === 0 ||
      selectedCompanies.includes(post.client)
    return searchMatch && statusMatch && locationMatch && companyMatch
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCompanyChipClick = () => setCompanyAnchorEl(companyBtnRef.current)
  const handleCompanyClose     = () => setCompanyAnchorEl(null)

  const toggleCompany = (option: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(option) ? prev.filter((c) => c !== option) : [...prev, option],
    )
  }

  const handleStatusChipClick = () => setStatusAnchorEl(statusBtnRef.current)
  const handleStatusClose     = () => setStatusAnchorEl(null)

  const toggleStatus = (option: StatusOption) => {
    setSelectedStatuses((prev) =>
      prev.includes(option) ? prev.filter((s) => s !== option) : [...prev, option],
    )
  }

  const handleLocationChipClick = () => setLocationAnchorEl(locationBtnRef.current)
  const handleLocationClose     = () => setLocationAnchorEl(null)

  const toggleLocation = (option: LocationOption) => {
    setSelectedLocations((prev) =>
      prev.includes(option) ? prev.filter((l) => l !== option) : [...prev, option],
    )
  }

  const companyOpen  = Boolean(companyAnchorEl)
  const statusOpen   = Boolean(statusAnchorEl)
  const locationOpen = Boolean(locationAnchorEl)

  const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>, rowId: string) => {
    setAnchorEl(event.currentTarget)
    setActiveRowId(rowId)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setActiveRowId(null)
  }

  const handleEditPost = () => {
    if (activeRowId) {
      onEditJobPost(activeRowId)
    }
    handleClose()
  }

  const handleDelete = () => {
    const idToDelete = activeRowId
    handleClose()
    if (!idToDelete) return

    // Optimistic removal
    setJobPosts((prev) => prev.filter((p) => p.mandateId !== idToDelete))

    mandateApi.deleteJobPost(idToDelete).catch(() => {
      // Restore the row if the request fails
      mandateApi.getJobPosts().then((envelope) => {
        setJobPosts(envelope.data ?? [])
      })
    })
  }

  const open = Boolean(anchorEl)

  return (
    <Box className={styles.pageRoot}>
      <Box className={styles.pageHeader}>
        <Typography component="h1" className={styles.pageTitle}>
          Job Posts
        </Typography>
        <Button
          variant="contained"
          className={styles.newMandateBtn}
          onClick={onNewJobPost}
          disableElevation
        >
          New Job Post
        </Button>
      </Box>

      <Box className={styles.filtersRow}>
        {/* Company dropdown chip */}
        <ButtonBase
          ref={companyBtnRef}
          component="button"
          className={`${styles.filterChip} ${selectedCompanies.length > 0 || companyOpen ? styles.filterChipActive : ''}`}
          disableRipple
          onClick={handleCompanyChipClick}
          aria-haspopup="true"
          aria-expanded={companyOpen ? 'true' : undefined}
        >
          {/* Building / company icon */}
          <svg className={styles.filterChipSvgIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="5" width="8" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 7h2.5a.5.5 0 0 1 .5.5V14h-3V7Z" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 8.5h1M7.5 8.5h1M4.5 11h1M7.5 11h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M5.5 14v-2.5h3V14" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Company
        </ButtonBase>

        {/* Location dropdown chip */}
        <ButtonBase
          ref={locationBtnRef}
          component="button"
          className={`${styles.filterChip} ${selectedLocations.length > 0 || locationOpen ? styles.filterChipActive : ''}`}
          disableRipple
          onClick={handleLocationChipClick}
          aria-haspopup="true"
          aria-expanded={locationOpen ? 'true' : undefined}
        >
          {/* Pin / location icon */}
          <svg className={styles.filterChipSvgIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 1.5A4.25 4.25 0 0 0 3.75 5.75C3.75 9.25 8 14.5 8 14.5S12.25 9.25 12.25 5.75A4.25 4.25 0 0 0 8 1.5Z"
              stroke="currentColor" strokeWidth="1.3" fill="none"
            />
            <circle cx="8" cy="5.75" r="1.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          Location
        </ButtonBase>

        {/* Status dropdown chip */}
        <ButtonBase
          ref={statusBtnRef}
          component="button"
          className={`${styles.filterChip} ${selectedStatuses.length > 0 || statusOpen ? styles.filterChipActive : ''}`}
          disableRipple
          onClick={handleStatusChipClick}
          aria-haspopup="true"
          aria-expanded={statusOpen ? 'true' : undefined}
        >
          {/* Circle-check / status icon */}
          <svg className={styles.filterChipSvgIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 8l1.75 1.75L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Status
        </ButtonBase>

        <Box component="label" className={styles.searchField}>
          {/* Magnifier / search icon */}
          <svg className={styles.filterChipSvgIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search job posts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search job posts"
          />
        </Box>
      </Box>

      {/* Company dropdown popover */}
      <Popover
        open={companyOpen}
        anchorEl={companyAnchorEl}
        onClose={handleCompanyClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { className: styles.filterDropdownPaper } }}
      >
        {companyOptions.map((option) => (
          <div
            key={option}
            role="menuitemcheckbox"
            aria-checked={selectedCompanies.includes(option)}
            tabIndex={0}
            className={styles.filterDropdownItem}
            onClick={() => toggleCompany(option)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCompany(option) } }}
          >
            <span className={`${styles.filterCheckboxIcon} ${selectedCompanies.includes(option) ? styles.filterCheckboxIconChecked : ''}`} aria-hidden="true" />
            <span className={styles.filterDropdownLabel}>{option}</span>
          </div>
        ))}
      </Popover>

      {/* Status dropdown popover */}
      <Popover
        open={statusOpen}
        anchorEl={statusAnchorEl}
        onClose={handleStatusClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { className: styles.filterDropdownPaper } }}
      >
        {STATUS_OPTIONS.map((option) => (
          <div
            key={option}
            role="menuitemcheckbox"
            aria-checked={selectedStatuses.includes(option)}
            tabIndex={0}
            className={styles.filterDropdownItem}
            onClick={() => toggleStatus(option)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStatus(option) } }}
          >
            <span className={`${styles.filterCheckboxIcon} ${selectedStatuses.includes(option) ? styles.filterCheckboxIconChecked : ''}`} aria-hidden="true" />
            <span className={styles.filterDropdownLabel}>{option}</span>
          </div>
        ))}
      </Popover>

      {/* Location dropdown popover */}
      <Popover
        open={locationOpen}
        anchorEl={locationAnchorEl}
        onClose={handleLocationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { className: styles.filterDropdownPaper } }}
      >
        {LOCATION_OPTIONS.map((option) => (
          <div
            key={option}
            role="menuitemcheckbox"
            aria-checked={selectedLocations.includes(option)}
            tabIndex={0}
            className={styles.filterDropdownItem}
            onClick={() => toggleLocation(option)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleLocation(option) } }}
          >
            <span className={`${styles.filterCheckboxIcon} ${selectedLocations.includes(option) ? styles.filterCheckboxIconChecked : ''}`} aria-hidden="true" />
            <span className={styles.filterDropdownLabel}>{option}</span>
          </div>
        ))}
      </Popover>

      {/* Table */}
      <Box className={styles.tableWrap}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!loading && error && (
          <Typography sx={{ textAlign: 'center', py: 6, color: 'error.main' }}>
            {error}
          </Typography>
        )}

        {!loading && !error && filteredRows.length === 0 && (
          <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            No job posts found.
          </Typography>
        )}

        {!loading && !error && filteredRows.length > 0 && (
          <Box className={styles.table}>
            {filteredRows.map((post) => {
              const displayStatus = toTitleCase(post.status)
              const isDraft       = post.status.toUpperCase() === 'DRAFT'
              const timeline      = `${formatDate(post.openDate)} – ${formatDate(post.targetCloseDate)}`

              return (
                <Box key={post.mandateId} className={styles.tableRow}>
                  <Box className={styles.companyStrip}>
                    <Box className={styles.companyLogo}>{initials(post.client)}</Box>
                    <Typography component="span" className={styles.companyName}>
                      {post.client}
                    </Typography>
                  </Box>

                  <Box className={styles.gridHeader}>
                    <Typography component="span" className={styles.gridLabel}>JOB TITLE</Typography>
                    <Typography component="span" className={styles.gridLabel}>INDUSTRY</Typography>
                    <Typography component="span" className={styles.gridLabel}>LOCATION</Typography>
                    <Box className={styles.timelineHeader}>
                      <Typography component="span" className={styles.gridLabel}>TIMELINE</Typography>
                      <Box component="span" className={styles.timelineIcon} aria-hidden="true">⌃⌄</Box>
                    </Box>
                    <Typography component="span" className={styles.gridLabel}>STATUS</Typography>
                  </Box>

                  <Box className={styles.gridBody}>
                    <Typography component="span" className={styles.gridValue}>{post.title}</Typography>
                    <Typography component="span" className={styles.gridValue}>{post.industry}</Typography>
                    <Typography component="span" className={styles.gridValue}>{post.location}</Typography>
                    <Typography component="span" className={styles.gridValue}>{timeline}</Typography>
                    <Box className={styles.statusCell}>
                      <Box className={`${styles.statusPill} ${isDraft ? styles.statusDraft : styles.statusPosted}`}>
                        {displayStatus}
                      </Box>
                    </Box>
                    <ButtonBase
                      component="button"
                      className={`${styles.moreButton} ${activeRowId === post.mandateId && open ? styles.moreButtonActive : ''}`}
                      disableRipple
                      aria-label={`More actions for ${post.title}`}
                      aria-haspopup="true"
                      aria-expanded={activeRowId === post.mandateId && open ? 'true' : undefined}
                      onClick={(e) => handleMoreClick(e as React.MouseEvent<HTMLButtonElement>, post.mandateId)}
                    >
                      <Box component="span" className={styles.moreDot} />
                      <Box component="span" className={styles.moreDot} />
                      <Box component="span" className={styles.moreDot} />
                    </ButtonBase>
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { className: styles.menuPaper },
        }}
      >
        <ButtonBase className={styles.menuItem} onClick={handleEditPost} disableRipple>
          <svg
            className={styles.menuIcon}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M14.166 2.5a2.357 2.357 0 0 1 3.334 3.334L6.25 17.083 2.5 17.5l.417-3.75L14.166 2.5Z"
              stroke="#4d4d4d"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Edit post
        </ButtonBase>

        <ButtonBase className={`${styles.menuItem} ${styles.menuItemDelete}`} onClick={handleDelete} disableRipple>
          <svg
            className={styles.menuIcon}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M3.333 5.833h13.334M8.333 9.167v5M11.667 9.167v5M4.167 5.833l.833 10c0 .92.746 1.667 1.667 1.667h6.666c.92 0 1.667-.747 1.667-1.667l.833-10M7.5 5.833V3.333a.833.833 0 0 1 .833-.833h3.334a.833.833 0 0 1 .833.833v2.5"
              stroke="#d32f2f"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Delete
        </ButtonBase>
      </Popover>
    </Box>
  )
}
