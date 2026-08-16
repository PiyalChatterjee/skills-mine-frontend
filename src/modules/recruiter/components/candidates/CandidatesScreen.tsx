import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { recruiterCandidatesApi } from '@/services/api/recruiterCandidatesApi'
import type { CandidateListItem } from '@/types/api'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './CandidatesScreen.module.css'

type CandidatesScreenProps = {
  // Props can be extended here if needed
}

export const CandidatesScreen = ({}: CandidatesScreenProps) => {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState<CandidateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <Box className={styles.pageRoot}>
      <Box className={styles.pageHeader}>
        <Typography component="h1" className={styles.pageTitle}>
          Candidates
        </Typography>
      </Box>

      <Box className={styles.filtersRow}>
        <ButtonBase className={styles.filterChip} disableRipple>
          <Box component="span" className={styles.filterChipIcon} aria-hidden="true">⌂</Box>
          Company
        </ButtonBase>
        <ButtonBase className={styles.filterChip} disableRipple>
          <Box component="span" className={styles.filterChipIcon} aria-hidden="true">⌖</Box>
          Location
        </ButtonBase>
        <Box className={styles.searchField}>
          <Box component="span" className={styles.filterChipIcon} aria-hidden="true">⌕</Box>
          <Typography component="span" className={styles.searchPlaceholder}>
            Search candidates
          </Typography>
        </Box>
      </Box>

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

        {!loading && !error && (
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
    </Box>
  )
}
