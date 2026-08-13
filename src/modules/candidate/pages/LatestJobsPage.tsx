import { useMemo, useState } from 'react'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { OpportunitiesSearchInput, OpportunityJobCard } from '@/components/opportunities'
import { useSearchQueryState } from '@/hooks/useSearchQueryState'
import { useJobsSearch } from '@/modules/public/hooks/useJobsSearch'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { selectSavedJobIds } from '@/store/selectors'
import { addSavedJob, removeSavedJob } from '@/store/slices/candidateSlice'
import type { AppDispatch } from '@/store'
import type { Job } from '@/types'
import arrowRight from '@/assets/cv-builder/arrow-right.svg'
import { useSaveJob, useUserProfile } from '../hooks/useCandidateQueries'
import styles from './LatestJobsPage.module.css'

const toCityFromLocation = (location: string) => {
  const [city] = location.split(',')
  return city?.trim() || 'Unknown'
}

const fallbackMatchScores = [95, 90, 60, 60, 92, 88, 84, 78]

const getMatchScore = (index: number) => {
  return fallbackMatchScores[index % fallbackMatchScores.length]
}

const LatestJobsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const savedJobIds = useSelector(selectSavedJobIds)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  const {
    inputValue: searchInputValue,
    normalizedValue: normalizedSearchTerm,
    debouncedValue: debouncedSearchTerm,
    shouldFilter: shouldFilterOpportunities,
    shouldUseDebouncedQuery: shouldUseApiSearch,
    handleInputChange: handleSearchChange,
    clear: handleClearSearch,
  } = useSearchQueryState({
    minCharacters: 3,
    debounceMs: 250,
  })

  useUserProfile(user?.userId)
  const [saveJobTrigger] = useSaveJob()

  const {
    allJobs,
    visibleJobs,
    isJobsError,
    jobsError,
    isJobsLoading,
  } = useJobsSearch({
    normalizedSearchTerm,
    shouldFilter: shouldFilterOpportunities,
    shouldUseDebouncedQuery: shouldUseApiSearch,
    debouncedSearchTerm,
  })

  const jobsWithMatch = useMemo(() => {
    return visibleJobs.map((job, index) => ({
      ...job,
      matchScore: getMatchScore(index),
    }))
  }, [visibleJobs])

  const handleSave = async (job: Job) => {
    if (savingIds.has(job.jobId)) return

    const isCurrentlySaved = savedJobIds.has(job.jobId)

    if (isCurrentlySaved) {
      dispatch(removeSavedJob(job.jobId))
    } else {
      dispatch(
        addSavedJob({
          jobId: job.jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          industry: job.industry,
          salaryRange: job.salaryRange,
          workType: job.workType,
          employmentType: job.employmentType,
        }),
      )
    }

    setSavingIds((prev) => new Set(prev).add(job.jobId))

    try {
      await saveJobTrigger(job.jobId).unwrap()
    } catch {
      if (isCurrentlySaved) {
        dispatch(
          addSavedJob({
            jobId: job.jobId,
            title: job.title,
            company: job.company,
            location: job.location,
            industry: job.industry,
            salaryRange: job.salaryRange,
            workType: job.workType,
            employmentType: job.employmentType,
          }),
        )
      } else {
        dispatch(removeSavedJob(job.jobId))
      }
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(job.jobId)
        return next
      })
    }
  }

  return (
    <Box className={styles.pageRoot}>
      <Box className={styles.headerRow}>
        <Box className={styles.headingWrap}>
          <ButtonBase
            type="button"
            className={styles.backButton}
            onClick={() => navigate(ROUTE_PATHS.candidateDashboard)}
            disableRipple
          >
            <span className={styles.backButtonIconWrap} aria-hidden="true">
              <Box component="img" src={arrowRight} alt="" className={styles.backButtonArrow} />
            </span>
            <span className={styles.backButtonText}>Back</span>
          </ButtonBase>
          <Typography component="h1" className={styles.pageTitle}>
            Latest Opportunities
          </Typography>
        </Box>

        <Box className={styles.searchArea}>
          <OpportunitiesSearchInput
            value={searchInputValue}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
          />
        </Box>
      </Box>

      {isJobsError ? (
        <Typography component="p" className={styles.feedback}>
          {jobsError?.message || 'Failed to load jobs.'}
        </Typography>
      ) : isJobsLoading ? (
        <Box className={styles.loadingState} aria-live="polite" aria-busy="true">
          <CircularProgress size={28} />
        </Box>
      ) : allJobs.length > 0 ? (
        jobsWithMatch.length > 0 ? (
          <Box className={styles.cardGrid}>
            {jobsWithMatch.map((job) => {
              const isSaved = savedJobIds.has(job.jobId)
              const isSaving = savingIds.has(job.jobId)

              return (
                <OpportunityJobCard
                  key={job.jobId}
                  title={job.title}
                  description={job.description ?? ''}
                  tags={[
                    job.industry,
                    toCityFromLocation(job.location ?? ''),
                    job.employmentType,
                  ].filter(Boolean) as string[]}
                  actionLabel="View"
                  onAction={() => navigate(ROUTE_PATHS.jobs)}
                  matchScore={job.matchScore}
                  showSaveButton
                  isSaved={isSaved}
                  isSaving={isSaving}
                  onToggleSave={() => {
                    void handleSave(job)
                  }}
                  saveLabel={isSaved ? `Unsave ${job.title}` : `Save ${job.title}`}
                />
              )
            })}
          </Box>
        ) : (
          <Typography component="p" className={styles.feedback}>
            {shouldFilterOpportunities ? 'No jobs found for your search.' : 'No jobs available right now.'}
          </Typography>
        )
      ) : (
        <Typography component="p" className={styles.feedback}>
          No jobs available right now.
        </Typography>
      )}
    </Box>
  )
}

export default LatestJobsPage
