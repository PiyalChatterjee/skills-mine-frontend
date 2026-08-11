import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material'
import { FormProvider } from 'react-hook-form'
import arrowRightIconSrc from '@/assets/cv-builder/arrow-right.svg'
import patternOneSrc from '@/assets/cv-builder/pattern-1.svg'
import patternTwoSrc from '@/assets/cv-builder/pattern-2.svg'
import { useProfileCreationWizard } from '@/modules/candidate/hooks/useProfileCreationWizard'
import styles from '@/modules/candidate/pages/ProfileCreationPage.module.css'
import ProfileCreationBasicStep from './ProfileCreationBasicStep'
import ProfileCreationEducationExperienceStep from './ProfileCreationEducationExperienceStep'
import ProfileCreationReviewStep from './ProfileCreationReviewStep'

const ProfileCreationWizard = () => {
  const {
    form,
    currentStepIndex,
    totalSteps,
    activeStepId,
    canGoNext,
    handleBack,
    handleNext,
    isLoading,
    isFetching,
    isError,
    loadErrorMessage,
    submitError,
    isSubmitting,
    isMissingUser,
  } = useProfileCreationWizard()

  let stepContent = null
  const isBasicDetailsStep = activeStepId === 'basic-details'
  const isReviewStep = activeStepId === 'review'

  if (isBasicDetailsStep) {
    stepContent = <ProfileCreationBasicStep />
  } else if (activeStepId === 'education-experience') {
    stepContent = <ProfileCreationEducationExperienceStep />
  } else if (isReviewStep) {
    stepContent = <ProfileCreationReviewStep />
  }

  if (isMissingUser) {
    return (
      <Box className={styles.statusBox}>
        <Alert severity="error">
          Unable to load profile creation because no authenticated user is available.
        </Alert>
      </Box>
    )
  }

  if ((isLoading || isFetching) && !form.formState.isDirty) {
    return (
      <Box className={styles.statusBox}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <FormProvider {...form}>
      <Box className={styles.pageRoot}>
        <Box component="section" className={styles.heroSection}>
          <img
            src={patternOneSrc}
            alt=""
            aria-hidden="true"
            className={styles.heroPattern1}
          />
          <img
            src={patternTwoSrc}
            alt=""
            aria-hidden="true"
            className={styles.heroPattern2}
          />

          <Box className={styles.heroContent}>
            <Typography component="h1" className={styles.heroHeading}>
              Create your profile
            </Typography>

            <Box className={styles.stepsIndicator} aria-label="Profile creation progress">
              {Array.from({ length: totalSteps }, (_, index) => (
                <span
                  key={index}
                  className={`${styles.step} ${index === currentStepIndex ? styles.stepActive : ''}`}
                  aria-hidden="true"
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Box component="section" className={styles.contentSection}>
          {isBasicDetailsStep ? (
            <>
              <Typography component="h2" className={styles.pageTitle}>
                Let’s create your profile.
              </Typography>
              <Typography component="p" className={styles.pageSubtitle}>
                Don’t worry this will only take a minute.
              </Typography>
            </>
          ) : isReviewStep ? (
            <Typography component="h2" className={styles.introText}>
              Review your profile details.
            </Typography>
          ) : (
            <Typography component="h2" className={styles.introText}>
              Now, let’s learn about your education and job experience.
            </Typography>
          )}

          {isError ? (
            <Alert severity="warning" className={styles.alertBanner}>
              {loadErrorMessage}
            </Alert>
          ) : null}

          {submitError ? (
            <Alert severity="error" className={styles.alertBanner}>
              {submitError}
            </Alert>
          ) : null}

          <Box
            component="form"
            id="profile-creation-form"
            className={styles.formWrap}
            noValidate
          >
            {stepContent}
          </Box>
        </Box>

        <Box className={styles.footerBar}>
          <Box className={styles.footerInner}>
            <Button
              type="button"
              onClick={handleBack}
              className={`${styles.backButton} wizard-back-button`}
              disableRipple
            >
              <img
                src={arrowRightIconSrc}
                alt=""
                aria-hidden="true"
                className={styles.buttonArrowBack}
              />
              Back
            </Button>

            <Box className={styles.footerRight}>
              <Button
                type="button"
                onClick={handleNext}
                className={`${styles.nextButton} ${isReviewStep ? styles.doneButton : ''}`}
                disabled={!canGoNext || isSubmitting}
                disableRipple
              >
                {isSubmitting ? 'Saving…' : isReviewStep ? 'Done' : 'Next'}
                {isReviewStep ? null : (
                  <img
                    src={arrowRightIconSrc}
                    alt=""
                    aria-hidden="true"
                    className={styles.buttonArrowNext}
                  />
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </FormProvider>
  )
}

export default ProfileCreationWizard