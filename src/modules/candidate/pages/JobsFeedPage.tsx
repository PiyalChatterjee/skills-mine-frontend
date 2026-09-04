import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { OpportunitiesSearchInput, OpportunityJobCard } from '@/components/opportunities'
import arrowRight from '@/assets/cv-builder/arrow-right.svg'
import { useJobsFeedViewModel, type JobsFeedMode } from '../hooks/useJobsFeedViewModel'
import styles from './LatestJobsPage.module.css'

type JobsFeedPageProps = {
  mode: JobsFeedMode
}

export const JobsFeedPage = ({ mode }: JobsFeedPageProps) => {
  const {
    emptyMessage,
    handleBack,
    handleClearSearch,
    handleSearchChange,
    handleToggleSave,
    handleViewJob,
    hasJobs,
    hasNextPage,
    isError,
    isLatestMode,
    isLoading,
    isSavedOnlyMode,
    jobCards,
    jobsLoadTriggerRef,
    loadErrorMessage,
    loadMoreMessage,
    modeConfig,
    searchInputValue,
  } = useJobsFeedViewModel(mode)

  return (
    <Box className={[styles.pageRoot, isSavedOnlyMode ? styles.savedPageRoot : ''].filter(Boolean).join(' ')}>
      <Box className={[styles.headerRow, isSavedOnlyMode ? styles.savedHeaderRow : ''].filter(Boolean).join(' ')}>
        <Box className={styles.headingWrap}>
          <ButtonBase
            type="button"
            className={styles.backButton}
            onClick={handleBack}
            disableRipple
          >
            <span className={styles.backButtonIconWrap} aria-hidden="true">
              <Box component="img" src={arrowRight} alt="" className={styles.backButtonArrow} />
            </span>
            <span className={styles.backButtonText}>Back</span>
          </ButtonBase>
          <Typography
            component="h1"
            className={[styles.pageTitle, isSavedOnlyMode ? styles.savedPageTitle : ''].filter(Boolean).join(' ')}
          >
            {modeConfig.title}
          </Typography>
        </Box>

        {modeConfig.showSearch ? (
          <Box className={styles.searchArea}>
            <OpportunitiesSearchInput
              value={searchInputValue}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
            />
          </Box>
        ) : null}
      </Box>

      {isError ? (
        <Typography component="p" className={styles.feedback}>
          {loadErrorMessage}
        </Typography>
      ) : isLoading ? (
        <Box className={styles.loadingState} aria-live="polite" aria-busy="true">
          <CircularProgress size={28} />
        </Box>
      ) : hasJobs ? (
        <>
          <Box className={[styles.cardGrid, isSavedOnlyMode ? styles.savedCardGrid : ''].filter(Boolean).join(' ')}>
            {jobCards.map((card) => (
                <OpportunityJobCard
                  key={card.jobId}
                  title={card.title}
                  description={card.description}
                  tags={card.tags}
                  actionLabel="View"
                  onAction={() => handleViewJob(card.job)}
                  matchScore={card.matchScore}
                  applicationStatus={card.applicationStatus}
                  applicationStatusKey={card.applicationStatusKey}
                  showSaveButton
                  isSaved={card.isSaved}
                  isSaving={card.isSaving}
                  onToggleSave={() => handleToggleSave(card.jobId)}
                  saveLabel={card.saveLabel}
                />
              ))}
          </Box>

          {isLatestMode && hasNextPage ? (
            <Box
              ref={jobsLoadTriggerRef}
              className={`${styles.feedback} ${styles.feedbackCentered}`}
              aria-live="polite"
            >
              {loadMoreMessage}
            </Box>
          ) : null}
        </>
      ) : (
        <Typography component="p" className={styles.feedback}>
          {emptyMessage}
        </Typography>
      )}
    </Box>
  )
}
