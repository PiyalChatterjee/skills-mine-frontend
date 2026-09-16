import { Box, Button, ButtonBase, CircularProgress, Popover, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { mandateApi } from '@/services/api/mandateApi'
import { pushNotification } from '@/store/slices/notificationSlice'
import type { AppDispatch } from '@/store'
import type { JobPost } from '@/types/api'
import styles from './MandatesScreen.module.css'

type MandatesScreenProps = {
  onNewJobPost: () => void
  onEditJobPost: (mandateId: string) => void
}

const PAGE_SIZE = 10

const STATUS_OPTIONS = ['Posted', 'Closed'] as const
type StatusOption = (typeof STATUS_OPTIONS)[number]

type CompanyOption = { name: string; clientId: string }

/** Format ISO date string to "D Mon YYYY" e.g. "15 Oct 2024" */
function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const day   = d.getDate()
  const month = d.toLocaleString('en-GB', { month: 'short' }).slice(0, 3)
  const year  = d.getFullYear()
  return `${day} ${month} ${year}`
}

/** Capitalise first letter, lowercase rest e.g. "POSTED" → "Posted" */
function toTitleCase(s: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export const MandatesScreen = ({ onNewJobPost, onEditJobPost }: MandatesScreenProps) => {
  const dispatch = useDispatch<AppDispatch>()

  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const [anchorEl, setAnchorEl]       = useState<HTMLButtonElement | null>(null)
  const [activeRowId, setActiveRowId] = useState<string | null>(null)

  // Status filter dropdown
  const statusBtnRef = useRef<HTMLButtonElement | null>(null)
  const [statusAnchorEl, setStatusAnchorEl]     = useState<HTMLButtonElement | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<StatusOption[]>([])

  // Company filter dropdown — stores the selected clientId (single selection)
  const companyBtnRef = useRef<HTMLButtonElement | null>(null)
  const [companyAnchorEl, setCompanyAnchorEl]   = useState<HTMLButtonElement | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  // Stable company list seeded from the initial unfiltered load
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([])

  // Search query
  const [searchQuery, setSearchQuery] = useState('')

  // Timeline sort: 'asc' | 'desc' | null
  const [timelineSortDir, setTimelineSortDir] = useState<'asc' | 'desc' | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Location filter dropdown
  const locationBtnRef = useRef<HTMLButtonElement | null>(null)
  const [locationAnchorEl, setLocationAnchorEl]   = useState<HTMLButtonElement | null>(null)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  // Stable location list seeded from the initial unfiltered load
  const [locationOptions, setLocationOptions] = useState<string[]>([])

  // ── Fetch job posts whenever filters change ───────────────────────────────
  useEffect(() => {
    setLoading(true)
    setError(null)
    mandateApi
      .getJobPosts({
        search:       searchQuery.trim() || undefined,
        status:       selectedStatuses.length === 1 ? selectedStatuses[0].toUpperCase() : undefined,
        locationText: selectedLocations.length > 0 ? [...selectedLocations] : undefined,
        clientId:     selectedClientId ?? undefined,
      })
      .then((envelope) => {
        const posts = envelope.data ?? []
        setJobPosts(posts)
        // Populate company and location options from the first (unfiltered) load only
        if (!selectedClientId && selectedLocations.length === 0 && selectedStatuses.length === 0 && !searchQuery.trim()) {
          const seen = new Map<string, string>()
          posts.forEach((p) => { if (p.clientId && p.client) seen.set(p.clientId, p.client) })
          setCompanyOptions(
            [...seen.entries()]
              .map(([clientId, name]) => ({ clientId, name }))
              .sort((a, b) => a.name.localeCompare(b.name)),
          )
          const locationsSeen = new Set<string>(['Remote', 'Hybrid'])
          posts.forEach((p) => { if (p.location) locationsSeen.add(p.location) })
          setLocationOptions([...locationsSeen].sort((a, b) => a.localeCompare(b)))
        }
      })
      .catch(() => {
        setError('Failed to load job posts. Please try again.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [searchQuery, selectedStatuses, selectedLocations, selectedClientId])

  // ── Reset page when filters change ───────────────────────────────────────
  useEffect(() => { setCurrentPage(1) }, [searchQuery, selectedStatuses, selectedLocations, selectedClientId])

  // ── Strip CANCELLED rows, then optionally sort by fill-by date ───────────
  const filteredRows = useMemo(() => {
    const rows = jobPosts.filter((post) => post.status.toUpperCase() !== 'CANCELLED')
    if (!timelineSortDir) return rows
    return [...rows].sort((a, b) => {
      const aTime = a.targetCloseDate ? new Date(a.targetCloseDate).getTime() : 0
      const bTime = b.targetCloseDate ? new Date(b.targetCloseDate).getTime() : 0
      return timelineSortDir === 'asc' ? aTime - bTime : bTime - aTime
    })
  }, [jobPosts, timelineSortDir])

  const totalPages    = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const paginatedRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCompanyChipClick = () => setCompanyAnchorEl(companyBtnRef.current)
  const handleCompanyClose     = () => setCompanyAnchorEl(null)

  const toggleCompany = (clientId: string) => {
    setSelectedClientId((prev) => (prev === clientId ? null : clientId))
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

  const toggleLocation = (option: string) => {
    setSelectedLocations((prev) =>
      prev.includes(option) ? prev.filter((l) => l !== option) : [...prev, option],
    )
  }

  const companyOpen  = Boolean(companyAnchorEl)
  const selectedCompanyName = companyOptions.find((c) => c.clientId === selectedClientId)?.name ?? null
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

    const deletedPost = jobPosts.find((p) => p.mandateId === idToDelete)

    // Optimistic removal
    setJobPosts((prev) => prev.filter((p) => p.mandateId !== idToDelete))

    mandateApi.deleteJobPost(idToDelete)
      .then(() => {
        dispatch(pushNotification({
          level: 'success',
          title: 'Job post deleted',
          message: deletedPost ? `"${deletedPost.title}" has been deleted.` : undefined,
        }))
      })
      .catch(() => {
        // Restore the row if the request fails
        mandateApi.getJobPosts().then((envelope) => {
          setJobPosts(envelope.data ?? [])
        })
        dispatch(pushNotification({
          level: 'error',
          title: 'Delete failed',
          message: 'Could not delete the job post. Please try again.',
        }))
      })
  }

  const open = Boolean(anchorEl)

  return (
    <Box className={styles.pageRoot}>
      <Box className={styles.pageHeader}>
        <Typography component="h1" className={styles.pageTitle}>
          All Job Posts
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
          className={`${styles.filterChip} ${selectedClientId !== null || companyOpen ? styles.filterChipActive : ''}`}
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
          {selectedCompanyName ?? 'Company'}
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
            key={option.clientId}
            role="menuitemradio"
            aria-checked={selectedClientId === option.clientId}
            tabIndex={0}
            className={styles.filterDropdownItem}
            onClick={() => toggleCompany(option.clientId)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCompany(option.clientId) } }}
          >
            <span className={`${styles.filterCheckboxIcon} ${selectedClientId === option.clientId ? styles.filterCheckboxIconChecked : ''}`} aria-hidden="true" />
            <span className={styles.filterDropdownLabel}>{option.name}</span>
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
        {locationOptions.map((option) => (
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
            {paginatedRows.map((post) => {
              const displayStatus = toTitleCase(post.status)
              const isDraft       = post.status.toUpperCase() === 'DRAFT'
              const timeline      = `${formatDate(post.openDate)} – ${formatDate(post.targetCloseDate)}`

              return (
                <Box key={post.mandateId} className={styles.tableRow}>
                  <Box className={styles.companyStrip}>
                    <Typography component="span" className={styles.companyName}>
                      {post.client}
                    </Typography>
                  </Box>

                  <Box className={styles.gridHeader}>
                    <Typography component="span" className={styles.gridLabel}>JOB TITLE</Typography>
                    <Typography component="span" className={styles.gridLabel}>CLIENT RATE</Typography>
                    <Typography component="span" className={styles.gridLabel}>INDUSTRY</Typography>
                    <Typography component="span" className={styles.gridLabel}>LOCATION</Typography>
                    <Box className={styles.timelineHeader}>
                      <Typography component="span" className={styles.gridLabel}>TIMELINE</Typography>
                      <Box component="span" className={styles.timelineSortBtns} aria-label="Sort by timeline">
                        <button
                          type="button"
                          className={`${styles.timelineSortBtn} ${timelineSortDir === 'asc' ? styles.timelineSortBtnActive : ''}`}
                          aria-label="Sort ascending"
                          onClick={() => setTimelineSortDir((prev) => (prev === 'asc' ? null : 'asc'))}
                        >
                          <svg viewBox="0 0 10 6" fill="none" aria-hidden="true" width="10" height="6">
                            <path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={`${styles.timelineSortBtn} ${timelineSortDir === 'desc' ? styles.timelineSortBtnActive : ''}`}
                          aria-label="Sort descending"
                          onClick={() => setTimelineSortDir((prev) => (prev === 'desc' ? null : 'desc'))}
                        >
                          <svg viewBox="0 0 10 6" fill="none" aria-hidden="true" width="10" height="6">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </Box>
                    </Box>
                    <Typography component="span" className={styles.gridLabel}>STATUS</Typography>
                  </Box>

                  <Box className={styles.gridBody}>
                    <Typography component="span" className={styles.gridValue}>{post.title}</Typography>
                    <Typography component="span" className={styles.gridValue}>{post.clientRate || '—'}</Typography>
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

      {/* Pagination */}
      {!loading && !error && filteredRows.length > 0 && (
        <Box className={styles.pagination}>
          <ButtonBase
            component="button"
            className={styles.pageBtn}
            disableRipple
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            aria-label="Previous page"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ButtonBase>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <ButtonBase
              key={page}
              component="button"
              className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
              disableRipple
              onClick={() => goToPage(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </ButtonBase>
          ))}

          <ButtonBase
            component="button"
            className={styles.pageBtn}
            disableRipple
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            aria-label="Next page"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ButtonBase>
        </Box>
      )}

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
