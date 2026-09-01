import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Box, ButtonBase, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import InboundStageModal from '@/modules/recruiter/components/StageModals/InboundStageModal'
import ScreeningStageModal from '@/modules/recruiter/components/StageModals/ScreeningStageModal'
import AssessmentStageModal from '@/modules/recruiter/components/StageModals/AssessmentStageModal'
import ShortlistStageModal from '@/modules/recruiter/components/StageModals/ShortlistStageModal'
import InterviewStageModal from '@/modules/recruiter/components/StageModals/InterviewStageModal'
import OfferStageModal from '@/modules/recruiter/components/StageModals/OfferStageModal'
import ClosedStageModal from '@/modules/recruiter/components/StageModals/ClosedStageModal'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { RootState } from '@/store'
import type { PipelineStage } from '@/modules/recruiter/types'
import styles from './CandidatePipelinePage.module.css'

// ── Icons ──────────────────────────────────────────────────────────────

const BackArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#B0B4B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18l6-6-6-6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="#2B96D9" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="#2B96D9" strokeWidth="1.7"/>
  </svg>
)

const ExpandIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="#2B96D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Stage configuration ────────────────────────────────────────────────

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: 'Inbound',     label: 'Inbound'     },
  { key: 'Screening',   label: 'Screening'   },
  { key: 'Assessment',  label: 'Assessment'  },
  { key: 'Shortlisted', label: 'Shortlist'   },
  { key: 'Interview',   label: 'Interview'   },
  { key: 'Offer',       label: 'Offer'       },
  { key: 'Closed',      label: 'Closed'      },
]

// Card background & avatar colours per stage
const STAGE_CARD_BG: Record<PipelineStage, string> = {
  Inbound:     '#FAEED8',
  Screening:   '#E4DFF4',
  Assessment:  '#FCF7DB',
  Shortlisted: '#F4DBE8',
  Interview:   '#D3E5E8',
  Offer:       '#DBEFE3',
  Placed:      '#DBEFE3',
  Closed:      '#f2f4f6',
}

const STAGE_AVATAR_BG: Record<PipelineStage, string> = {
  Inbound:     '#E6A83B',
  Screening:   '#7A5DC7',
  Assessment:  '#F2D64B',
  Shortlisted: '#C64B8C',
  Interview:   '#257C8A',
  Offer:       '#4BAF73',
  Placed:      '#4BAF73',
  Closed:      '#90a4ae',
}

// Avatar icon per stage (simple user silhouette, coloured)
const AvatarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" stroke="#ffffff" strokeWidth="1.8"/>
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

// ── Candidate Card ─────────────────────────────────────────────────────

interface CardProps {
  name: string
  title: string
  company: string
  stage: PipelineStage
  onView: () => void
  onExpand?: () => void
}

const CandidateCard = ({ name, title, company, stage, onView, onExpand }: CardProps) => (
  <Box className={styles.card} style={{ background: STAGE_CARD_BG[stage] }}>
    <Box className={styles.cardTop}>
      <Box className={styles.cardAvatar} style={{ background: STAGE_AVATAR_BG[stage] }}>
        <AvatarIcon />
      </Box>
      <Box className={styles.cardInfo}>
        <Typography component="p" className={styles.cardName} style={{ fontSize: '12px' }}>{name}</Typography>
        <Typography component="p" className={styles.cardTitle} style={{ fontSize: '10px' }}>{title}</Typography>
        <Box className={styles.cardCompanyRow}>
          <Box className={styles.companyDot} style={{ background: '#03478C' }} />
          <Typography component="span" className={styles.cardCompany} style={{ fontSize: '9px' }}>{company}</Typography>
        </Box>
      </Box>
    </Box>
    <Box className={styles.cardFooter}>
      <ButtonBase className={styles.cardIconBtn} disableRipple onClick={onView} aria-label="View candidate">
        <EyeIcon />
      </ButtonBase>
      <ButtonBase className={styles.cardIconBtn} disableRipple onClick={onExpand} aria-label="Expand stage details">
        <ExpandIcon />
      </ButtonBase>
    </Box>
  </Box>
)

// ── Modal state types ──────────────────────────────────────────────────

interface ModalCandidateState {
  candidateName: string
  candidateTitle: string
  company: string
}

// ── Main Component ─────────────────────────────────────────────────────

const CandidatePipelinePage = () => {
  const navigate = useNavigate()
  const { cardId } = useParams<{ cardId: string }>()
  const [inboundModal, setInboundModal] = useState<ModalCandidateState | null>(null)
  const [screeningModal, setScreeningModal] = useState<ModalCandidateState | null>(null)
  const [assessmentModal, setAssessmentModal] = useState<ModalCandidateState | null>(null)
  const [shortlistModal, setShortlistModal] = useState<ModalCandidateState | null>(null)
  const [interviewModal, setInterviewModal] = useState<ModalCandidateState | null>(null)
  const [offerModal, setOfferModal] = useState<ModalCandidateState | null>(null)
  const [closedModal, setClosedModal] = useState<ModalCandidateState | null>(null)

  const mandate = useSelector((state: RootState) =>
    state.recruiterPipeline.mandates.find(m => m.id === cardId)
  )

  const candidates = useSelector((state: RootState) =>
    state.recruiterPipeline.candidates.filter(c => c.mandateId === cardId)
  )

  const handleViewCandidate = (candidateId: string) => {
    const path = ROUTE_PATHS.recruiterCandidate
      .replace(':cardId', cardId ?? '')
      .replace(':candidateId', candidateId)
    navigate(path)
  }

  const handleBack = () => {
    navigate(
      ROUTE_PATHS.recruiterMandate.replace(':cardId', cardId ?? '')
    )
  }

  // Count per stage
  const stageCounts = STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = candidates.filter(c => c.currentStage === s.key).length
    return acc
  }, {})

  const pageTitle = mandate
    ? `${mandate.title}, ${mandate.company}`
    : 'Candidate Pipeline'

  // Recruiter contact (static per image — "Zanele Ngcobo")
  const RECRUITER_NAME  = 'Zanele Ngcobo'
  const RECRUITER_EMAIL = 'zanele@buildright.co.za'
  const RECRUITER_PHONE = '074 822 7669'

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />

      <Box className={styles.pageRoot}>

        {/* ── Breadcrumb header bar ── */}
        <Box className={styles.breadcrumbBar}>
          <ButtonBase className={styles.backBtn} onClick={handleBack} disableRipple>
            <BackArrowIcon /> Back
          </ButtonBase>
          <Box className={styles.breadcrumbDivider} />
          <Typography component="span" className={styles.breadcrumbSection}>
            Candidate Pipeline
          </Typography>
          <Box className={styles.breadcrumbArrow}><ChevronRightIcon /></Box>
          <Typography component="span" className={styles.breadcrumbCurrent}>
            {pageTitle}
          </Typography>
        </Box>

        {/* ── Recruiter contact strip ── */}
        <Box className={styles.contactStrip}>
          <Box className={styles.contactBox}>
            <Typography component="span" className={styles.contactName} style={{ fontSize: '14px' }}>{RECRUITER_NAME}</Typography>
            <Box className={styles.contactDivider} />
            <Typography
              component="a"
              href={`mailto:${RECRUITER_EMAIL}`}
              className={styles.contactEmail}
              style={{ fontSize: '16px' }}
            >
              {RECRUITER_EMAIL}
            </Typography>
            <Box className={styles.contactDivider} />
            <Typography component="span" className={styles.contactPhone} style={{ fontSize: '16px' }}>{RECRUITER_PHONE}</Typography>
          </Box>
        </Box>

        {/* ── Stage tab bar ── */}
        <Box className={styles.stageBar}>
          {STAGES.map((s, i) => (
            <Box key={s.key} className={styles.stageTabWrapper}>
              {i > 0 && <Box className={styles.stageTabDivider} />}
              <Box className={styles.stageTab}>
                <Typography component="span" className={styles.stageLabel}>{s.label}</Typography>
                <Box className={styles.stageBadge}>{stageCounts[s.key] ?? 0}</Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── Kanban board ── */}
        <Box className={styles.kanbanBoard}>
          {STAGES.map(s => {
            const cols = candidates.filter(c => c.currentStage === s.key)
            return (
              <Box key={s.key} className={styles.kanbanCol}>
                {cols.map(c => (
                  <CandidateCard
                    key={c.id}
                    name={c.name}
                    title={c.title}
                    company={mandate?.company ?? ''}
                    stage={s.key}
                    onView={() => handleViewCandidate(c.id)}
                    onExpand={
                      s.key === 'Inbound' ? () => setInboundModal({
                        candidateName: c.name,
                        candidateTitle: c.title,
                        company: mandate?.company ?? '',
                      }) :
                      s.key === 'Screening' ? () => setScreeningModal({
                        candidateName: c.name,
                        candidateTitle: c.title,
                        company: mandate?.company ?? '',
                      }) :
                      s.key === 'Assessment' ? () => setAssessmentModal({
                        candidateName: c.name,
                        candidateTitle: c.title,
                        company: mandate?.company ?? '',
                      }) :
                      s.key === 'Shortlisted' ? () => setShortlistModal({
                        candidateName: c.name,
                        candidateTitle: c.title,
                        company: mandate?.company ?? '',
                      }) :
                      s.key === 'Interview' ? () => setInterviewModal({
                        candidateName: c.name,
                        candidateTitle: c.title,
                        company: mandate?.company ?? '',
                      }) :
                      s.key === 'Offer' ? () => setOfferModal({
                        candidateName: c.name,
                        candidateTitle: c.title,
                        company: mandate?.company ?? '',
                      }) :
                      s.key === 'Closed' ? () => setClosedModal({
                        candidateName: c.name,
                        candidateTitle: c.title,
                        company: mandate?.company ?? '',
                      }) :
                      undefined
                    }
                  />
                ))}
              </Box>
            )
          })}
        </Box>

      </Box>

      {/* ── Inbound stage modal ── */}
      {inboundModal && (
        <InboundStageModal
          candidateName={inboundModal.candidateName}
          candidateTitle={inboundModal.candidateTitle}
          company={inboundModal.company}
          onClose={() => setInboundModal(null)}
        />
      )}

      {/* ── Screening stage modal ── */}
      {screeningModal && (
        <ScreeningStageModal
          candidateName={screeningModal.candidateName}
          candidateTitle={screeningModal.candidateTitle}
          company={screeningModal.company}
          onClose={() => setScreeningModal(null)}
        />
      )}

      {/* ── Assessment stage modal ── */}
      {assessmentModal && (
        <AssessmentStageModal
          candidateName={assessmentModal.candidateName}
          candidateTitle={assessmentModal.candidateTitle}
          company={assessmentModal.company}
          onClose={() => setAssessmentModal(null)}
        />
      )}

      {/* ── Shortlist stage modal ── */}
      {shortlistModal && (
        <ShortlistStageModal
          candidateName={shortlistModal.candidateName}
          candidateTitle={shortlistModal.candidateTitle}
          company={shortlistModal.company}
          onClose={() => setShortlistModal(null)}
        />
      )}

      {/* ── Interview stage modal ── */}
      {interviewModal && (
        <InterviewStageModal
          candidateName={interviewModal.candidateName}
          candidateTitle={interviewModal.candidateTitle}
          company={interviewModal.company}
          onClose={() => setInterviewModal(null)}
        />
      )}

      {/* ── Offer stage modal ── */}
      {offerModal && (
        <OfferStageModal
          candidateName={offerModal.candidateName}
          candidateTitle={offerModal.candidateTitle}
          company={offerModal.company}
          onClose={() => setOfferModal(null)}
        />
      )}

      {/* ── Closed stage modal ── */}
      {closedModal && (
        <ClosedStageModal
          candidateName={closedModal.candidateName}
          candidateTitle={closedModal.candidateTitle}
          company={closedModal.company}
          onClose={() => setClosedModal(null)}
        />
      )}
    </Box>
  )
}

export default CandidatePipelinePage
