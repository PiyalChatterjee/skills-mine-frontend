import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import InboundStageModal from '@/modules/recruiter/components/StageModals/InboundStageModal'
import ScreeningStageModal from '@/modules/recruiter/components/StageModals/ScreeningStageModal'
import AssessmentStageModal from '@/modules/recruiter/components/StageModals/AssessmentStageModal'
import ShortlistStageModal from '@/modules/recruiter/components/StageModals/ShortlistStageModal'
import InterviewStageModal from '@/modules/recruiter/components/StageModals/InterviewStageModal'
import OfferStageModal from '@/modules/recruiter/components/StageModals/OfferStageModal'
import ClosedStageModal from '@/modules/recruiter/components/StageModals/ClosedStageModal'
import CandidateHistoryModal from '@/modules/recruiter/components/StageModals/CandidateHistoryModal'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { mandateApi } from '@/services/api/mandateApi'
import type { PipelineStage } from '@/modules/recruiter/types'
import type { RecruiterPipelineCard, RecruiterPipelineStage } from '@/types/api'
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
  Closed:      '#4BAF73',
}

const STAGE_AVATAR_BG: Record<PipelineStage, string> = {
  Inbound:     '#E6A83B',
  Screening:   '#7A5DC7',
  Assessment:  '#F2D64B',
  Shortlisted: '#C64B8C',
  Interview:   '#257C8A',
  Offer:       '#4BAF73',
  Placed:      '#4BAF73',
  Closed:      '#DBEFE3',
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
  isOverlay?: boolean
  isRejected?: boolean
}

const CandidateCard = ({ name, title, company, stage, onView, onExpand, isOverlay, isRejected }: CardProps) => {
  const isClosed = stage === 'Closed'
  const bg     = isRejected ? '#E05252' : STAGE_CARD_BG[stage]
  const txtCol = (isRejected || isClosed) ? '#ffffff' : undefined
  const dotCol = isRejected ? '#ffffff' : '#03478C'
  const avatarBg = isRejected ? 'rgba(255,255,255,0.25)' : STAGE_AVATAR_BG[stage]
  return (
    <Box
      className={styles.card}
      style={{
        background: bg,
        opacity: isOverlay ? 0.95 : 1,
        boxShadow: isOverlay ? '0 6px 20px rgba(0,0,0,0.18)' : undefined,
      }}
    >
      <Box className={styles.cardTop}>
        <Box className={styles.cardAvatar} style={{ background: avatarBg }}>
          <AvatarIcon />
        </Box>
        <Box className={styles.cardInfo}>
          <Typography component="p" className={styles.cardName} style={{ fontSize: '12px', color: txtCol }}>{name}</Typography>
          <Typography component="p" className={styles.cardTitle} style={{ fontSize: '10px', color: txtCol }}>{title}</Typography>
          <Box className={styles.cardCompanyRow}>
            <Box className={styles.companyDot} style={{ background: dotCol }} />
            <Typography component="span" className={styles.cardCompany} style={{ fontSize: '9px', color: txtCol }}>{company}</Typography>
          </Box>
        </Box>
      </Box>
      <Box className={styles.cardFooter}>
        <ButtonBase className={styles.cardIconBtn} style={{ background: bg }} disableRipple onClick={onView} aria-label="View candidate">
          <EyeIcon />
        </ButtonBase>
        <ButtonBase className={styles.cardIconBtn} style={{ background: bg }} disableRipple onClick={onExpand} aria-label="Expand stage details">
          <ExpandIcon />
        </ButtonBase>
      </Box>
    </Box>
  )
}

// ── Draggable card wrapper ──────────────────────────────────────────────

interface DraggableCardProps extends CardProps {
  applicationId: string
}

const DraggableCard = ({ applicationId, isRejected, ...cardProps }: DraggableCardProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: applicationId })
  return (
    <div
      ref={setNodeRef}
      {...(isRejected ? {} : { ...listeners, ...attributes })}
      style={{ opacity: isDragging ? 0.35 : 1, cursor: isRejected ? 'default' : 'grab', outline: 'none' }}
    >
      <CandidateCard {...cardProps} isRejected={isRejected} />
    </div>
  )
}

// ── Droppable column wrapper ────────────────────────────────────────────

interface DroppableColProps {
  stageKey: string
  children: React.ReactNode
}

const DroppableCol = ({ stageKey, children }: DroppableColProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: stageKey })
  return (
    <Box
      ref={setNodeRef}
      className={styles.kanbanCol}
      style={isOver ? { outline: '2px dashed #2B96D9', outlineOffset: '-2px', borderRadius: '8px' } : undefined}
    >
      {children}
    </Box>
  )
}

// ── Modal state types ──────────────────────────────────────────────────

interface ModalCandidateState {
  candidateName: string
  candidateTitle: string
  company: string
  applicationId: string
  jobId: string
}

// ── Helpers ────────────────────────────────────────────────────────────

function candidateName(card: RecruiterPipelineCard): string {
  return `${card.candidate.firstName} ${card.candidate.lastName}`
}

const STAGE_CODE_MAP: Record<string, PipelineStage> = {
  INBOUND:    'Inbound',
  SCREENING:  'Screening',
  ASSESSMENT: 'Assessment',
  SHORTLIST:  'Shortlisted',
  SHORTLISTED:'Shortlisted',
  INTERVIEW:  'Interview',
  OFFER:      'Offer',
  CLOSED:     'Closed',
}

function cardStage(card: RecruiterPipelineCard): PipelineStage {
  return STAGE_CODE_MAP[card.currentStageCode?.toUpperCase()] ?? 'Inbound'
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

  const [historyModal, setHistoryModal] = useState<{ candidateName: string; candidateTitle: string; applicationId: string; candidateId: string; visitorId?: string } | null>(null)

  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set())

  const [pipelineStages, setPipelineStages] = useState<RecruiterPipelineStage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCard, setActiveCard] = useState<RecruiterPipelineCard | null>(null)
  const [apiStageCounts, setApiStageCounts] = useState<Record<string, number> | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  useEffect(() => {
    if (!cardId) return
    mandateApi.listPipelines({ jobProfileId: cardId, page: 1, size: 100 })
      .then(res => {
        const grouped = STAGES.map(s => ({
          label: s.key,
          colorClass: '',
          cards: res.data
            .filter(app => STAGE_CODE_MAP[app.currentStageCode?.toUpperCase()] === s.key)
            .map((app): RecruiterPipelineCard => ({
              applicationId:       app.applicationId,
              applicationPartyId:  app.applicationPartyId,
              assignedRecruiterId: app.assignedRecruiterId,
              currentStageCode:    app.currentStageCode,
              sourceCode:          app.sourceCode,
              matchScoreLatest:    app.matchScoreLatest ?? 0,
              createdAt:           app.createdAt,
              applicationStatus:   '',
              offerDetails:        null,
              closedAt:            null,
              companyIcon:         '',
              tone:                '',
              stage:               s.key,
              jobProfile: {
                jobProfileId:   app.jobProfile.jobProfileId,
                positionTitle:  app.jobProfile.positionTitle,
                clientId:       app.jobProfile.clientId,
                clientName:     app.jobProfile.clientName,
                fillByDate:     app.jobProfile.fillByDate,
                workType:       app.jobProfile.workType,
                employmentType: app.jobProfile.employmentType,
                status:         '',
              },
              candidate: {
                candidateId:   app.candidate.candidateId ?? app.candidate.candidate_id ?? '',
                visitorId:     app.candidate.visitorId,
                firstName:     app.candidate.firstName,
                lastName:      app.candidate.lastName,
                email:         '',
                phone:         '',
                profileStatus: '',
              },
            })),
        }))
        setPipelineStages(grouped)
        // Use stageCounters from the API response for the tab badges
        setApiStageCounts(res.stageCounters ?? null)
      })
      .finally(() => setLoading(false))
  }, [cardId])

  const handleDragStart = ({ active }: DragStartEvent) => {
    for (const stage of pipelineStages) {
      const found = stage.cards.find(c => c.applicationId === active.id)
      if (found) { setActiveCard(found); break }
    }
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null)
    if (!over || active.id === over.id) return
    const targetStage = over.id as string

    setPipelineStages(prev => {
      let movedCard: RecruiterPipelineCard | undefined
      const withoutCard = prev.map(stage => {
        const idx = stage.cards.findIndex(c => c.applicationId === active.id)
        if (idx === -1) return stage
        movedCard = stage.cards[idx]
        return { ...stage, cards: stage.cards.filter((_, i) => i !== idx) }
      })
      if (!movedCard) return prev
      // If dropped onto a card's column the over.id will be a stageKey; guard against dropping on self-column
      const sourceStage = prev.find(s => s.cards.some(c => c.applicationId === active.id))?.label
      if (sourceStage === targetStage) return prev
      return withoutCard.map(stage => {
        if (stage.label !== targetStage) return stage
        return { ...stage, cards: [...stage.cards, { ...movedCard!, stage: targetStage }] }
      })
    })
  }

  const handleViewCandidate = (candidateId: string, visitorId?: string) => {
    const id = candidateId || visitorId || ''
    if (id) navigate(ROUTE_PATHS.recruiterCandidateDetail.replace(':candidateId', id))
  }

  const handleBack = () => {
    navigate(
      ROUTE_PATHS.recruiterMandate.replace(':cardId', cardId ?? '')
    )
  }

  // Prefer stageCounters from the API response; fall back to grouped card counts
  const stageCounts = STAGES.reduce<Record<string, number>>((acc, s) => {
    if (apiStageCounts) {
      // Map PipelineStage key back to the uppercase code the API uses
      const codeKey = Object.entries(STAGE_CODE_MAP).find(([, v]) => v === s.key)?.[0] ?? s.key.toUpperCase()
      acc[s.key] = apiStageCounts[codeKey] ?? 0
    } else {
      acc[s.key] = pipelineStages.find(p => p.label === s.key)?.cards.length ?? 0
    }
    return acc
  }, {})

  const pageTitle = 'Candidate Pipeline'

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
        {loading ? (
          <Box className={styles.kanbanBoard} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Box className={styles.kanbanBoard}>
              {STAGES.map(s => {
                const stageData = pipelineStages.find(p => p.label === s.key)
                const cards = stageData?.cards ?? []
                return (
                  <DroppableCol key={s.key} stageKey={s.key}>
                    {cards.map(card => {
                      const name    = candidateName(card)
                      const title   = card.jobProfile.positionTitle
                      const company = card.jobProfile.clientName
                      const stage   = s.key
                      const makeModal = (setter: (v: ModalCandidateState) => void) =>
                        () => setter({
                          candidateName: name,
                          candidateTitle: title,
                          company,
                          applicationId: card.applicationId,
                          jobId: card.jobProfile.jobProfileId,
                        })
                      return (
                        <DraggableCard
                          key={card.applicationId}
                          applicationId={card.applicationId}
                          name={name}
                          title={title}
                          company={company}
                          stage={stage}
                          isRejected={rejectedIds.has(card.applicationId)}
                          onView={() => setHistoryModal({
                            candidateName:  name,
                            candidateTitle: title,
                            applicationId:  card.applicationId,
                            candidateId:    card.candidate.candidateId,
                            visitorId:      card.candidate.visitorId,
                          })}
                          onExpand={
                            s.key === 'Inbound'     ? makeModal(setInboundModal)    :
                            s.key === 'Screening'   ? makeModal(setScreeningModal)  :
                            s.key === 'Assessment'  ? makeModal(setAssessmentModal) :
                            s.key === 'Shortlisted' ? makeModal(setShortlistModal)  :
                            s.key === 'Interview'   ? makeModal(setInterviewModal)  :
                            s.key === 'Offer'       ? makeModal(setOfferModal)      :
                            s.key === 'Closed'      ? makeModal(setClosedModal)     :
                            undefined
                          }
                        />
                      )
                    })}
                  </DroppableCol>
                )
              })}
            </Box>
            <DragOverlay>
              {activeCard && (
                <CandidateCard
                  name={candidateName(activeCard)}
                  title={activeCard.jobProfile.positionTitle}
                  company={activeCard.jobProfile.clientName}
                  stage={cardStage(activeCard)}
                  onView={() => {}}
                  isOverlay
                />
              )}
            </DragOverlay>
          </DndContext>
        )}

      </Box>

      {/* ── Candidate history modal ── */}
      {historyModal && (
        <CandidateHistoryModal
          candidateName={historyModal.candidateName}
          candidateTitle={historyModal.candidateTitle}
          applicationId={historyModal.applicationId}
          candidateId={historyModal.candidateId}
          onClose={() => setHistoryModal(null)}
          onViewProfile={() => {
            handleViewCandidate(historyModal.candidateId, historyModal.visitorId)
            setHistoryModal(null)
          }}
        />
      )}

      {/* ── Inbound stage modal ── */}
      {inboundModal && (
        <InboundStageModal
          candidateName={inboundModal.candidateName}
          candidateTitle={inboundModal.candidateTitle}
          company={inboundModal.company}
          applicationId={inboundModal.applicationId}
          jobId={inboundModal.jobId}
          onClose={() => setInboundModal(null)}
          onAdvance={(advancedId) => {
            setPipelineStages(prev =>
              prev.map(stageGroup => {
                if (stageGroup.label === 'Inbound') {
                  return { ...stageGroup, cards: stageGroup.cards.filter(c => c.applicationId !== advancedId) }
                }
                if (stageGroup.label === 'Screening') {
                  const moved = prev
                    .find(sg => sg.label === 'Inbound')
                    ?.cards.find(c => c.applicationId === advancedId)
                  if (!moved) return stageGroup
                  return { ...stageGroup, cards: [...stageGroup.cards, { ...moved, stage: 'Screening' }] }
                }
                return stageGroup
              })
            )
          }}
        />
      )}

      {/* ── Screening stage modal ── */}
      {screeningModal && (
        <ScreeningStageModal
          candidateName={screeningModal.candidateName}
          candidateTitle={screeningModal.candidateTitle}
          company={screeningModal.company}
          applicationId={screeningModal.applicationId}
          jobId={screeningModal.jobId}
          onClose={() => setScreeningModal(null)}
          onAdvance={(advancedId) => {
            setPipelineStages(prev =>
              prev.map(sg => {
                if (sg.label === 'Screening') return { ...sg, cards: sg.cards.filter(c => c.applicationId !== advancedId) }
                if (sg.label === 'Assessment') {
                  const moved = prev.find(s => s.label === 'Screening')?.cards.find(c => c.applicationId === advancedId)
                  if (!moved) return sg
                  return { ...sg, cards: [...sg.cards, { ...moved, stage: 'Assessment' }] }
                }
                return sg
              })
            )
          }}
          onMoveBack={(movedId) => {
            setPipelineStages(prev =>
              prev.map(sg => {
                if (sg.label === 'Screening') return { ...sg, cards: sg.cards.filter(c => c.applicationId !== movedId) }
                if (sg.label === 'Inbound') {
                  const moved = prev.find(s => s.label === 'Screening')?.cards.find(c => c.applicationId === movedId)
                  if (!moved) return sg
                  return { ...sg, cards: [...sg.cards, { ...moved, stage: 'Inbound' }] }
                }
                return sg
              })
            )
          }}
          onRejected={(id) => { setRejectedIds(prev => new Set(prev).add(id)); setScreeningModal(null) }}
        />
      )}

      {/* ── Assessment stage modal ── */}
      {assessmentModal && (
        <AssessmentStageModal
          candidateName={assessmentModal.candidateName}
          candidateTitle={assessmentModal.candidateTitle}
          company={assessmentModal.company}
          applicationId={assessmentModal.applicationId}
          jobId={assessmentModal.jobId}
          onClose={() => setAssessmentModal(null)}
          onAdvance={(advancedId) => {
            setPipelineStages(prev =>
              prev.map(sg => {
                if (sg.label === 'Assessment') return { ...sg, cards: sg.cards.filter(c => c.applicationId !== advancedId) }
                if (sg.label === 'Shortlisted') {
                  const moved = prev.find(s => s.label === 'Assessment')?.cards.find(c => c.applicationId === advancedId)
                  if (!moved) return sg
                  return { ...sg, cards: [...sg.cards, { ...moved, stage: 'Shortlisted' }] }
                }
                return sg
              })
            )
          }}
          onMoveBack={(movedId) => {
            setPipelineStages(prev =>
              prev.map(sg => {
                if (sg.label === 'Assessment') return { ...sg, cards: sg.cards.filter(c => c.applicationId !== movedId) }
                if (sg.label === 'Screening') {
                  const moved = prev.find(s => s.label === 'Assessment')?.cards.find(c => c.applicationId === movedId)
                  if (!moved) return sg
                  return { ...sg, cards: [...sg.cards, { ...moved, stage: 'Screening' }] }
                }
                return sg
              })
            )
          }}
          onRejected={(id) => { setRejectedIds(prev => new Set(prev).add(id)); setAssessmentModal(null) }}
        />
      )}

      {/* ── Shortlist stage modal ── */}
      {shortlistModal && (
        <ShortlistStageModal
          candidateName={shortlistModal.candidateName}
          candidateTitle={shortlistModal.candidateTitle}
          company={shortlistModal.company}
          applicationId={shortlistModal.applicationId}
          jobId={shortlistModal.jobId}
          onClose={() => setShortlistModal(null)}
          onAdvance={(advancedId) => {
            setPipelineStages(prev =>
              prev.map(sg => {
                if (sg.label === 'Shortlisted') return { ...sg, cards: sg.cards.filter(c => c.applicationId !== advancedId) }
                if (sg.label === 'Interview') {
                  const moved = prev.find(s => s.label === 'Shortlisted')?.cards.find(c => c.applicationId === advancedId)
                  if (!moved) return sg
                  return { ...sg, cards: [...sg.cards, { ...moved, stage: 'Interview' }] }
                }
                return sg
              })
            )
          }}
          onMoveBack={(movedId) => {
            setPipelineStages(prev =>
              prev.map(sg => {
                if (sg.label === 'Shortlisted') return { ...sg, cards: sg.cards.filter(c => c.applicationId !== movedId) }
                if (sg.label === 'Assessment') {
                  const moved = prev.find(s => s.label === 'Shortlisted')?.cards.find(c => c.applicationId === movedId)
                  if (!moved) return sg
                  return { ...sg, cards: [...sg.cards, { ...moved, stage: 'Assessment' }] }
                }
                return sg
              })
            )
          }}
          onRejected={(id) => { setRejectedIds(prev => new Set(prev).add(id)); setShortlistModal(null) }}
        />
      )}

      {/* ── Interview stage modal ── */}
      {interviewModal && (
        <InterviewStageModal
          candidateName={interviewModal.candidateName}
          candidateTitle={interviewModal.candidateTitle}
          company={interviewModal.company}
          applicationId={interviewModal.applicationId}
          jobId={interviewModal.jobId}
          onClose={() => setInterviewModal(null)}
          onAdvance={(advancedId) => {
            setPipelineStages(prev =>
              prev.map(sg => {
                if (sg.label === 'Interview') return { ...sg, cards: sg.cards.filter(c => c.applicationId !== advancedId) }
                if (sg.label === 'Offer') {
                  const moved = prev.find(s => s.label === 'Interview')?.cards.find(c => c.applicationId === advancedId)
                  if (!moved) return sg
                  return { ...sg, cards: [...sg.cards, { ...moved, stage: 'Offer' }] }
                }
                return sg
              })
            )
          }}
          onMoveBack={(movedId) => {
            setPipelineStages(prev =>
              prev.map(sg => {
                if (sg.label === 'Interview') return { ...sg, cards: sg.cards.filter(c => c.applicationId !== movedId) }
                if (sg.label === 'Shortlisted') {
                  const moved = prev.find(s => s.label === 'Interview')?.cards.find(c => c.applicationId === movedId)
                  if (!moved) return sg
                  return { ...sg, cards: [...sg.cards, { ...moved, stage: 'Shortlisted' }] }
                }
                return sg
              })
            )
          }}
          onRejected={(id) => { setRejectedIds(prev => new Set(prev).add(id)); setInterviewModal(null) }}
        />
      )}

      {/* ── Offer stage modal ── */}
      {offerModal && (
        <OfferStageModal
          candidateName={offerModal.candidateName}
          candidateTitle={offerModal.candidateTitle}
          company={offerModal.company}
          applicationId={offerModal.applicationId}
          jobId={offerModal.jobId}
          onClose={() => setOfferModal(null)}
          onAdvance={(advancedId) => {
            setPipelineStages(prev =>
              prev.map(sg => {
                if (sg.label === 'Offer') return { ...sg, cards: sg.cards.filter(c => c.applicationId !== advancedId) }
                if (sg.label === 'Closed') {
                  const moved = prev.find(s => s.label === 'Offer')?.cards.find(c => c.applicationId === advancedId)
                  if (!moved) return sg
                  return { ...sg, cards: [...sg.cards, { ...moved, stage: 'Closed' }] }
                }
                return sg
              })
            )
          }}
          onMoveBack={(movedId) => {
            setPipelineStages(prev =>
              prev.map(sg => {
                if (sg.label === 'Offer') return { ...sg, cards: sg.cards.filter(c => c.applicationId !== movedId) }
                if (sg.label === 'Interview') {
                  const moved = prev.find(s => s.label === 'Offer')?.cards.find(c => c.applicationId === movedId)
                  if (!moved) return sg
                  return { ...sg, cards: [...sg.cards, { ...moved, stage: 'Interview' }] }
                }
                return sg
              })
            )
          }}
          onRejected={(id) => { setRejectedIds(prev => new Set(prev).add(id)); setOfferModal(null) }}
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
