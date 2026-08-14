import { useMemo } from 'react'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { OpportunitiesSearchInput, OpportunityJobCard } from '@/components/opportunities'
import { useInfiniteScrollTrigger } from '@/hooks/useInfiniteScrollTrigger'
import { useSearchQueryState } from '@/hooks/useSearchQueryState'
import { useJobsSearch } from '@/modules/public/hooks/useJobsSearch'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { setSelectedJobId } from '@/store/slices/candidateSlice'
import { selectRecommendedJobIds } from '@/store/selectors'

import type { AppDispatch } from '@/store'
import arrowRight from '@/assets/cv-builder/arrow-right.svg'
import { useOptimisticSaveJob } from '../hooks/useOptimisticSaveJob'
import styles from './LatestJobsPage.module.css'

const toCityFromLocation = (location: string) => {
  const [city] = location.split(',')
  return city?.trim() || 'Unknown'
}

const fallbackMatchScores = [95, 90, 60, 60, 92, 88, 84, 78]

const getMatchScore = (index: number) => {
  return fallbackMatchScores[index % fallbackMatchScores.length]
}

export type JobsFeedMode = 'latest' | 'saved' | 'recommended'

type JobsFeedPageProps = {
  mode: JobsFeedMode
}

export const JobsFeedPage = ({ mode }: JobsFeedPageProps) => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { savedJobIds, isJobSaved, isJobSaving, toggleJobSaved } = useOptimisticSaveJob()
  const isSavedOnlyMode = mode === 'saved'
  const isRecommendedOnlyMode = mode === 'recommended'
  const recommendedJobIds = useSelector(selectRecommendedJobIds)

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

  const {
    allJobs,
    visibleJobs,
    isJobsError,
    jobsError,
    isJobsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useJobsSearch({
    normalizedSearchTerm,
    shouldFilter: shouldFilterOpportunities,
    shouldUseDebouncedQuery: shouldUseApiSearch,
    debouncedSearchTerm,
  })
  const jobsLoadTriggerRef = useInfiniteScrollTrigger({
    enabled: !isSavedOnlyMode && !isRecommendedOnlyMode,
    hasNextPage,
    isFetchingNextPage,
    isError: isJobsError,
    itemCount: visibleJobs.length,
    onLoadMore: fetchNextPage,
  })

  const jobsWithMatch = useMemo(() => {
    const candidateJobs = isSavedOnlyMode
      ? visibleJobs.filter((job) => savedJobIds.has(job.jobId))
      : isRecommendedOnlyMode
        ? visibleJobs.filter((job) => recommendedJobIds.has(job.jobId))
        : visibleJobs

    return candidateJobs.map((job, index) => ({
      ...job,
      matchScore: getMatchScore(index),
    }))
  }, [isRecommendedOnlyMode, isSavedOnlyMode, recommendedJobIds, savedJobIds, visibleJobs])

  return (
    <Box className={styles.pageRoot}>
      <Box className={styles.headerRow}>
        <Box className={styles.headingWrap}>
          <ButtonBase
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
            disableRipple
          >
            <span className={styles.backButtonIconWrap} aria-hidden="true">
              <Box component="img" src={arrowRight} alt="" className={styles.backButtonArrow} />
            </span>
            <span className={styles.backButtonText}>Back</span>
          </ButtonBase>
          <Typography component="h1" className={styles.pageTitle}>
            {isSavedOnlyMode ? 'Saved Jobs' : isRecommendedOnlyMode ? 'Recommended Jobs' : 'Latest Opportunities'}
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
      ) : jobsWithMatch.length > 0 ? (
        <>
          <Box className={styles.cardGrid}>
            {jobsWithMatch.map((job) => {
              const isSaved = isJobSaved(job.jobId)
              const isSaving = isJobSaving(job.jobId)

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
                  onAction={() => {
                    dispatch(setSelectedJobId(job.jobId))
                    navigate(ROUTE_PATHS.jobDetails.replace(':jobId', job.jobId), { state: { job } })
                  }}
                  matchScore={job.matchScore}
                  showSaveButton
                  isSaved={isSaved}
                  isSaving={isSaving}
                  onToggleSave={() => {
                    void toggleJobSaved(job.jobId)
                  }}
                  saveLabel={isSaved ? `Unsave ${job.title}` : `Save ${job.title}`}
                />
              )
            })}
          </Box>

          {!isSavedOnlyMode && !isRecommendedOnlyMode && hasNextPage ? (
            <Box
              ref={jobsLoadTriggerRef}
              className={styles.feedback}
              sx={{ textAlign: 'center' }}
              aria-live="polite"
            >
              {isFetchingNextPage ? 'Loading more opportunities...' : 'Scroll to load more opportunities'}
            </Box>
          ) : null}
        </>
      ) : (
        <Typography component="p" className={styles.feedback}>
          {isSavedOnlyMode || isRecommendedOnlyMode
            ? (isSavedOnlyMode ? savedJobIds : recommendedJobIds).size === 0
              ? `You have no ${isSavedOnlyMode ? 'saved' : 'recommended'} jobs yet.`
              : shouldFilterOpportunities
                ? `No ${isSavedOnlyMode ? 'saved' : 'recommended'} jobs found for your search.`
                : `No ${isSavedOnlyMode ? 'saved' : 'recommended'} jobs available right now.`
            : shouldFilterOpportunities
              ? 'No jobs found for your search.'
              : allJobs.length === 0
                ? 'No jobs available right now.'
                : 'No matching jobs found.'}
        </Typography>
      )}
    </Box>
  )
}
