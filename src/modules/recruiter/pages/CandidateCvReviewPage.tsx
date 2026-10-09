import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { FormProvider } from 'react-hook-form'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import CvBuilderReviewScreen from '@/modules/cv-builder/components/CvBuilderReviewScreen'
import useCvBuilder, { type CvBuilderPrefillData } from '@/modules/cv-builder/hooks/useCvBuilder'
import { isoToMonthName, buildBuildMyCvRequest } from '@/modules/cv-builder/hooks/useCvBuilderDone'
import { LANGUAGES_LIST } from '@/modules/cv-builder/types/cvBuilder'
import { recruiterCandidatesApi, type RecruiterCandidateCvBuild } from '@/services/api/recruiterCandidatesApi'
import { ROUTE_PATHS } from '@/routes/routePaths'
import detailStyles from '@/modules/recruiter/components/candidates/CandidateDetailScreen.module.css'
import recruiterShell from './CandidatesPage.module.css'

// ── Maps the real API response → form prefill shape ──────────────────────────
const toPrefillData = (data: RecruiterCandidateCvBuild): CvBuilderPrefillData => {
  const pd = data.personalDetails
  return {
    personalDetails: {
      fullName:            `${pd.firstName} ${pd.lastName}`.trim(),
      race:                pd.race,
      gender:              pd.gender,
      disabilityStatus:    pd.disabilityStatus,
      nationality:         pd.nationality,
      residentialLocation: pd.location,
      currentCompany:      pd.currentCompany,
      currentPosition:     pd.currentPosition,
      noticePeriod:        pd.noticePeriod,
    },
    careerHistory: data.careerHistory.map((entry) => ({
      companyName:   entry.companyName,
      positionHeld:  entry.positionHeld,
      startDate:     isoToMonthName(entry.startDate),
      endDate:       entry.isCurrent || !entry.endDate ? 'Present' : isoToMonthName(entry.endDate),
      isCurrentRole: entry.isCurrent || !entry.endDate,
      tasks:         entry.responsibilities.length > 0 ? entry.responsibilities : [''],
      projects:      entry.projects.length > 0 ? entry.projects : [''],
    })),
    skills: data.skills.map((name) => ({ name })),
    tertiaryEducation: data.tertiaryEducation.map((e) => ({
      institutionName:       e.institution,
      degreeOrCertification: e.qualification,
      yearCompleted:         e.yearCompleted,
    })),
    secondaryEducation: data.secondaryEducation.map((e) => ({
      institutionName:    e.institution,
      highestGradePassed: e.qualification,
      yearCompleted:      e.yearCompleted,
    })),
    languages: data.languages.filter(
      (l): l is (typeof LANGUAGES_LIST)[number] => LANGUAGES_LIST.includes(l as never),
    ),
    otherLanguage:
      data.languages.find((l) => !LANGUAGES_LIST.includes(l as never)) ?? '',
  }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const BackArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M7.9993 8.666V13.3327L2.666 7.9993L7.9993 2.666V7.3327H13.3327V8.666H7.9993Z" fill="#B0B4B8" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ── Inner component: owns data fetching & renders the recruiter CV layout ─────
const CandidateCvReviewInner = ({
  candidateId,
  visitorId,
}: {
  candidateId?: string
  visitorId?: string
}) => {
  const ownerId = (candidateId ?? visitorId)!
  const isVisitor = !candidateId && !!visitorId
  const navigate = useNavigate()
  const [prefill, setPrefill]             = useState<CvBuilderPrefillData | undefined>(undefined)
  const [candidateName, setCandidateName] = useState('')
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [saving, setSaving]               = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const fetchCv = isVisitor
      ? recruiterCandidatesApi.getVisitorCvBuild(ownerId)
      : recruiterCandidatesApi.getCandidateCvBuild(ownerId)
    fetchCv
      .then((data) => {
        if (cancelled) return
        const pd = data.personalDetails
        setCandidateName(`${pd.firstName} ${pd.lastName}`.trim())
        setPrefill(toPrefillData(data))
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load CV data. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [ownerId, isVisitor])

  const goToCandidates = () => navigate(ROUTE_PATHS.recruiterCandidates)
  const goToCandidate  = () =>
    isVisitor
      ? navigate(ROUTE_PATHS.recruiterVisitorDetail.replace(':visitorId', ownerId))
      : navigate(ROUTE_PATHS.recruiterCandidateDetail.replace(':candidateId', ownerId))

  const { form, selectedLanguageEntries } = useCvBuilder(prefill, /* forceApply */ true, /* initialView */ 'review')

  const handleSave = async () => {
    setSaving(true)
    try {
      // Build the SaveBuildMyCvRequest once — used for both the API save and PDF/DOCX generation
      const cvRequest = buildBuildMyCvRequest({
        formValues: form.getValues(),
        selectedLanguageEntries,
      })

      // 1. Persist the structured CV data
      await recruiterCandidatesApi.saveCandidateCvBuild(ownerId, cvRequest)

      const payloadText = JSON.stringify(cvRequest, null, 2)
      const pd = cvRequest.personalDetails
      const sanitize = (v: string) => v.trim().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase() || 'candidate'
      const pad = (n: number) => String(n).padStart(2, '0')
      const now = new Date()
      const timestamp = `${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}${now.getUTCFullYear()}${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`
      const baseName = `${sanitize(pd?.firstName ?? '')}${sanitize(pd?.lastName ?? '')}_recruiter_${timestamp}`

      // 2. Generate PDF and upload it as a candidate document (required)
      const { generateCvPdfBlobFromText } = await import(
        '@/modules/cv-builder/utils/downloadCvPdf'
      )
      const pdfBlob = await generateCvPdfBlobFromText(payloadText)
      const pdfFileName = `${baseName}.pdf`
      const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' })
      await recruiterCandidatesApi.uploadDocument({
        file:         pdfFile,
        ownerType:    isVisitor ? 'VISITOR' : 'CANDIDATE',
        ownerId:      ownerId,
        documentType: 'RESUME',
        title:        pdfFileName,
      })

      // 3. Generate DOCX and upload it alongside the PDF (best-effort)
      try {
        const [{ generateCvDocxBlob }, headerImageModule] = await Promise.all([
          import('@/modules/cv-builder/utils/generateCvDocx'),
          import('@/assets/cv-builder/skills-mine-cv-hero-img.png'),
        ])
        const docxBlob = await generateCvDocxBlob(payloadText, headerImageModule.default)
        const docxFileName = `${baseName}.docx`
        const docxFile = new File(
          [docxBlob],
          docxFileName,
          { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        )
        await recruiterCandidatesApi.uploadDocument({
          file:         docxFile,
          ownerType:    isVisitor ? 'VISITOR' : 'CANDIDATE',
          ownerId:      ownerId,
          documentType: 'RESUME',
          title:        docxFileName,
        })
      } catch {
        // DOCX failure is non-fatal — PDF was already saved successfully
      }

      goToCandidate()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box className={detailStyles.pageRoot}>

      {/* ── Breadcrumb bar — matches CandidateDetailScreen exactly ── */}
      <Box className={detailStyles.breadcrumbBar}>
        <ButtonBase className={detailStyles.backBtn} onClick={goToCandidate} disableRipple>
          <BackArrowIcon /> Back
        </ButtonBase>
        <ButtonBase className={detailStyles.breadcrumbLink} onClick={goToCandidates} disableRipple>
          Candidates
        </ButtonBase>
        <Box className={detailStyles.breadcrumbArrow}><ChevronRightIcon /></Box>
        <ButtonBase className={detailStyles.breadcrumbLink} onClick={goToCandidate} disableRipple>
          {loading ? '…' : (candidateName || 'Candidate')}
        </ButtonBase>
        <Box className={detailStyles.breadcrumbArrow}><ChevronRightIcon /></Box>
        <Typography component="span" className={detailStyles.breadcrumbCurrent}>
          Review &amp; Edit CV
        </Typography>
      </Box>

      {/* ── Content area ── */}
      <Box className={detailStyles.cvReviewContent} data-recruiter-cv-review>

        {loading ? (
          <Box className={detailStyles.centeredState}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Box className={detailStyles.centeredState}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <Box className={detailStyles.cvReviewCard}>
            {/* Description text — blue italic, inside the white card */}
            <Typography className={detailStyles.cvReviewCardDescription}>
              Evaluate candidates&apos; CVs, make necessary edits, and save for download
            </Typography>

            {/* CV review sections */}
            <FormProvider {...form}>
              <CvBuilderReviewScreen title="" description="" showGenerateSkills={false} />
            </FormProvider>

            {/* ── Save bar ── */}
            <Box className={detailStyles.cvReviewSaveBar}>
              <button
                type="button"
                className={detailStyles.cvReviewSaveBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

// ── Page shell: recruiter sidebar + inner content ─────────────────────────────
// Only ever reached by a RECRUITER (route lives inside RecruiterLayout).
// The candidate's CvBuilderPage (/candidate/cv-builder) is completely unaffected.
const CandidateCvReviewPage = () => {
  const { candidateId, visitorId } = useParams<{ candidateId?: string; visitorId?: string }>()

  return (
    <Box className={recruiterShell.shell}>
      <RecruiterSidebar />
      {(candidateId || visitorId)
        ? <CandidateCvReviewInner candidateId={candidateId} visitorId={visitorId} />
        : null}
    </Box>
  )
}

export default CandidateCvReviewPage
