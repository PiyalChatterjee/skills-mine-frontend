import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, ButtonBase, CircularProgress, Popover, Typography } from '@mui/material'
import { recruiterCandidatesApi } from '@/services/api/recruiterCandidatesApi'
import type { CandidateListItem, Pagination } from '@/types/api'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './CandidatesScreen.module.css'

const PAGE_SIZE = 10

const STATUS_OPTIONS = ['SUBMITTED', 'ACTIVE', 'ON_HOLD', 'CLOSED', 'CANCELLED', 'REJECTED', 'APPLIED'] as const
type StatusOption = (typeof STATUS_OPTIONS)[number]

function toTitleCase(s: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/_/g, ' ')
}

export const CandidatesScreen = () => {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState<CandidateListItem[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Company filter dropdown
  const companyBtnRef = useRef<HTMLButtonElement | null>(null)
  const [companyAnchorEl, setCompanyAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [companyInput, setCompanyInput] = useState('')
  const [committedCompany, setCommittedCompany] = useState('')

  // Location filter dropdown
  const locationBtnRef = useRef<HTMLButtonElement | null>(null)
  const [locationAnchorEl, setLocationAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  // Stable location list seeded from the first unfiltered load
  const [locationOptions, setLocationOptions] = useState<string[]>([])

  // Status filter dropdown
  const statusBtnRef = useRef<HTMLButtonElement | null>(null)
  const [statusAnchorEl, setStatusAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<StatusOption | null>(null)

  // Search query (debounced)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // ── Debounce search ──────────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(value)
      setCurrentPage(1)
    }, 400)
  }

  // ── Fetch candidates whenever filters or page change ─────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    recruiterCandidatesApi
      .listCandidates({
        page: currentPage,
        limit: PAGE_SIZE,
        search: searchQuery.trim() || undefined,
        location: selectedLocations.length > 0 ? selectedLocations[0] : undefined,
        companyName: committedCompany.trim() || undefined,
        status: selectedStatus ?? undefined,
      })
      .then((envelope) => {
        if (cancelled) return
        setCandidates(envelope.data.candidates)
        setPagination(envelope.data.pagination)

        // Seed location options from the first unfiltered load only
        if (
          locationOptions.length === 0 &&
          !searchQuery.trim() &&
          selectedLocations.length === 0 &&
          !committedCompany.trim() &&
          !selectedStatus
        ) {
          const seen = new Set<string>()
          envelope.data.candidates.forEach((c) => { if (c.location) seen.add(c.location) })
          setLocationOptions([...seen].sort((a, b) => a.localeCompare(b)))
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load candidates. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, selectedLocations, committedCompany, selectedStatus])

  // ── Reset to page 1 when filters change ──────────────────────────────────
  useEffect(() => { setCurrentPage(1) }, [searchQuery, selectedLocations, committedCompany, selectedStatus])

  const totalPages = Math.max(1, pagination.totalPages)

  const goToPage = useCallback((page: number) => { setCurrentPage(page) }, [])

  // ── Company chip handlers ──────────────────────────────────────────────────
  const companyOpen = Boolean(companyAnchorEl)
  const handleCompanyChipClick = () => setCompanyAnchorEl(companyBtnRef.current)
  const handleCompanyClose = () => {
    setCompanyAnchorEl(null)
    setCommittedCompany(companyInput)
  }

  // ── Location chip handlers ────────────────────────────────────────────────
  const locationOpen = Boolean(locationAnchorEl)
  const handleLocationChipClick = () => setLocationAnchorEl(locationBtnRef.current)
  const handleLocationClose = () => setLocationAnchorEl(null)
  const toggleLocation = (option: string) => {
    setSelectedLocations((prev) =>
      prev.includes(option) ? prev.filter((l) => l !== option) : [...prev, option],
    )
  }

  // ── Status chip handlers ──────────────────────────────────────────────────
  const statusOpen = Boolean(statusAnchorEl)
  const handleStatusChipClick = () => setStatusAnchorEl(statusBtnRef.current)
  const handleStatusClose = () => setStatusAnchorEl(null)
  const toggleStatus = (option: StatusOption) => {
    setSelectedStatus((prev) => (prev === option ? null : option))
  }

  return (
    <Box className={styles.pageRoot}>
      <Box className={styles.pageHeader}>
        <Typography component="h1" className={styles.pageTitle}>
          Candidates
        </Typography>
      </Box>

      <Box className={styles.filtersRow}>
        {/* Company dropdown chip */}
        <ButtonBase
          ref={companyBtnRef}
          component="button"
          className={`${styles.filterChip} ${committedCompany || companyOpen ? styles.filterChipActive : ''}`}
          disableRipple
          onClick={handleCompanyChipClick}
          aria-haspopup="true"
          aria-expanded={companyOpen ? 'true' : undefined}
        >
          <svg className={styles.filterChipSvgIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="5" width="8" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 7h2.5a.5.5 0 0 1 .5.5V14h-3V7Z" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 8.5h1M7.5 8.5h1M4.5 11h1M7.5 11h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M5.5 14v-2.5h3V14" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          {committedCompany || 'Company'}
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
          className={`${styles.filterChip} ${selectedStatus !== null || statusOpen ? styles.filterChipActive : ''}`}
          disableRipple
          onClick={handleStatusChipClick}
          aria-haspopup="true"
          aria-expanded={statusOpen ? 'true' : undefined}
        >
          <svg className={styles.filterChipSvgIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 8l1.75 1.75L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {selectedStatus ? toTitleCase(selectedStatus) : 'Status'}
        </ButtonBase>

        {/* Search input */}
        <Box component="label" className={styles.searchField}>
          <svg className={styles.filterChipSvgIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search candidates"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search candidates"
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
        <Box className={styles.companySearchWrap}>
          <input
            className={styles.companySearchInput}
            type="text"
            placeholder="Type company name…"
            value={companyInput}
            autoFocus
            onChange={(e) => setCompanyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { handleCompanyClose() }
              if (e.key === 'Escape') { setCompanyInput(committedCompany); setCompanyAnchorEl(null) }
            }}
            aria-label="Filter by company name"
          />
        </Box>
        {committedCompany && (
          <div
            role="button"
            tabIndex={0}
            className={styles.filterDropdownItem}
            onClick={() => { setCompanyInput(''); setCommittedCompany(''); setCompanyAnchorEl(null) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCompanyInput(''); setCommittedCompany(''); setCompanyAnchorEl(null) } }}
          >
            <span className={styles.filterDropdownLabel} style={{ color: '#c0392b', fontSize: 13 }}>✕ Clear filter</span>
          </div>
        )}
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
        {locationOptions.length === 0 && (
          <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: 'text.secondary' }}>
            No options available
          </Typography>
        )}
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
            role="menuitemradio"
            aria-checked={selectedStatus === option}
            tabIndex={0}
            className={styles.filterDropdownItem}
            onClick={() => toggleStatus(option)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStatus(option) } }}
          >
            <span className={`${styles.filterCheckboxIcon} ${selectedStatus === option ? styles.filterCheckboxIconChecked : ''}`} aria-hidden="true" />
            <span className={styles.filterDropdownLabel}>{toTitleCase(option)}</span>
          </div>
        ))}
      </Popover>

      {/* Table */}
      <Box className={styles.tableWrap}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {!loading && !error && candidates.length === 0 && (
          <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            No candidates found.
          </Typography>
        )}

        {!loading && !error && candidates.length > 0 && (
          <Box className={styles.table}>
            <Box className={styles.tableHeader}>
              <Typography component="span" className={styles.headerCell}>NAME</Typography>
              <Typography component="span" className={styles.headerCell}>TITLE</Typography>
              <Typography component="span" className={styles.headerCell}>COMPANY</Typography>
              <Typography component="span" className={styles.headerCell}>LOCATION</Typography>
              <Box className={styles.headerCell} />
            </Box>

            {candidates.map((row) => (
              <Box key={row.candidateId} className={styles.tableRow}>
                <ButtonBase
                  className={styles.cellNameBtn}
                  disableRipple
                  onClick={() =>
                    navigate(
                      ROUTE_PATHS.recruiterCandidateDetail.replace(
                        ':candidateId',
                        row.candidateId,
                      ),
                    )
                  }
                >
                  {row.fullName}
                </ButtonBase>
                <Typography component="span" className={styles.cellTitle}>
                  {row.currentTitle}
                </Typography>
                <Typography component="span" className={styles.cellCompany}>
                  {row.currentCompany}
                </Typography>
                <Typography component="span" className={styles.cellLocation}>
                  {row.location}
                </Typography>
                <ButtonBase
                  className={styles.moreButton}
                  disableRipple
                  aria-label={`More actions for ${row.fullName}`}
                >
                  <Box component="span" className={styles.moreDot} />
                  <Box component="span" className={styles.moreDot} />
                  <Box component="span" className={styles.moreDot} />
                </ButtonBase>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Pagination */}
      {!loading && !error && pagination.total > 0 && (
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
    </Box>
  )
}
