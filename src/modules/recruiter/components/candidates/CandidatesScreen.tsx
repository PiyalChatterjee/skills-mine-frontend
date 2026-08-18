import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, ButtonBase, CircularProgress, Popover, Typography } from '@mui/material'
import { recruiterCandidatesApi } from '@/services/api/recruiterCandidatesApi'
import type { CandidateListItem } from '@/types/api'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './CandidatesScreen.module.css'

export const CandidatesScreen = () => {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState<CandidateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Company filter dropdown
  const companyBtnRef = useRef<HTMLButtonElement | null>(null)
  const [companyAnchorEl, setCompanyAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])

  // Location filter dropdown
  const locationBtnRef = useRef<HTMLButtonElement | null>(null)
  const [locationAnchorEl, setLocationAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  // Search query
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false

    recruiterCandidatesApi
      .listCandidates()
      .then((envelope) => {
        if (!cancelled) {
          setCandidates(envelope.data.candidates)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load candidates. Please try again.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // ── Derived options from loaded data ─────────────────────────────────────
  const companyOptions = useMemo(
    () => [...new Set(candidates.map((c) => c.currentCompany).filter(Boolean))].sort(),
    [candidates],
  )

  const locationOptions = useMemo(
    () => [...new Set(candidates.map((c) => c.location).filter(Boolean))].sort(),
    [candidates],
  )

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredRows = candidates.filter((c) => {
    const q = searchQuery.trim().toLowerCase()
    const searchMatch =
      q === '' ||
      c.fullName.toLowerCase().includes(q) ||
      c.currentTitle?.toLowerCase().includes(q) ||
      c.currentCompany?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q)
    const companyMatch =
      selectedCompanies.length === 0 || selectedCompanies.includes(c.currentCompany)
    const locationMatch =
      selectedLocations.length === 0 ||
      selectedLocations.some((l) => c.location?.toLowerCase().includes(l.toLowerCase()))
    return searchMatch && companyMatch && locationMatch
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const companyOpen = Boolean(companyAnchorEl)
  const locationOpen = Boolean(locationAnchorEl)

  const handleCompanyChipClick = () => setCompanyAnchorEl(companyBtnRef.current)
  const handleCompanyClose = () => setCompanyAnchorEl(null)
  const toggleCompany = (option: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(option) ? prev.filter((c) => c !== option) : [...prev, option],
    )
  }

  const handleLocationChipClick = () => setLocationAnchorEl(locationBtnRef.current)
  const handleLocationClose = () => setLocationAnchorEl(null)
  const toggleLocation = (option: string) => {
    setSelectedLocations((prev) =>
      prev.includes(option) ? prev.filter((l) => l !== option) : [...prev, option],
    )
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {!loading && !error && filteredRows.length === 0 && (
          <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            No candidates found.
          </Typography>
        )}

        {!loading && !error && filteredRows.length > 0 && (
          <Box className={styles.table}>
            <Box className={styles.tableHeader}>
              <Typography component="span" className={styles.headerCell}>NAME</Typography>
              <Typography component="span" className={styles.headerCell}>TITLE</Typography>
              <Typography component="span" className={styles.headerCell}>COMPANY</Typography>
              <Typography component="span" className={styles.headerCell}>LOCATION</Typography>
              <Box className={styles.headerCell} />
            </Box>

            {filteredRows.map((row) => (
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
    </Box>
  )
}
