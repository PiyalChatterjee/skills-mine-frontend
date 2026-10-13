import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { RecruiterSidebar } from "@/modules/recruiter/components/RecruiterSidebar";
import { RecruiterTour } from "@/modules/recruiter/components/RecruiterTour";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/app/auth/AuthContext";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { mandateApi } from "@/services/api/mandateApi";
import type {
  PipelineDashboardStats,
  RecruiterDashboardData,
  RecruiterMandatesData,
  UniversalPipelineItem,
} from "@/types/api";
import styles from "./RecruiterPage.module.css";

// ── Types ─────────────────────────────────────────────────────────────

type PipelineStageLabel =
  | "Inbound"
  | "Screening"
  | "Assessment"
  | "Interview"
  | "Shortlisted"
  | "Offer"
  | "Closed";

type CardTone =
  | "cream"
  | "lilac"
  | "yellow"
  | "blush"
  | "ice"
  | "mint"
  | "success"
  | "danger";

type PipelineCard = {
  id: string;
  jobProfileId: string;
  title: string;
  company: string;
  companyIcon: string;
  tone: CardTone;
  stage: PipelineStageLabel;
};

type PipelineColumn = {
  label: PipelineStageLabel;
  colorClass: string;
  cards: PipelineCard[];
};

// ── Constants ─────────────────────────────────────────────────────────

/** Column skeleton — no cards; cards are loaded from the API. */
const PIPELINE_COLUMNS: PipelineColumn[] = [
  { label: "Inbound",    colorClass: styles.colInbound,    cards: [] },
  { label: "Screening",  colorClass: styles.colScreening,  cards: [] },
  { label: "Assessment", colorClass: styles.colAssessment, cards: [] },
  { label: "Interview",  colorClass: styles.colInterview,  cards: [] },
  { label: "Shortlisted",colorClass: styles.colShortlist,  cards: [] },
  { label: "Offer",      colorClass: styles.colOffer,      cards: [] },
  { label: "Closed",     colorClass: styles.colClosed,     cards: [] },
];

// ── Sub-components ────────────────────────────────────────────────────

const CvsDueIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="4"
      y="3"
      width="16"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M8 8h8M8 12h8M8 16h5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const InterviewsIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const OfferLetterIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M3 8l9 6 9-6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type KpiCardProps = {
  value: number;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
};

const KpiCard = ({ value, label, icon, colorClass }: KpiCardProps) => (
  <Box className={`${styles.kpiCard} ${colorClass}`}>
    <Box className={styles.kpiTop}>
      <Typography component="p" className={styles.kpiValue}>
        {value}
      </Typography>
      <Box className={styles.kpiIcon} aria-hidden="true">
        {icon}
      </Box>
    </Box>
    <Typography component="p" className={styles.kpiLabel}>
      {label}
    </Typography>
    <Box className={styles.kpiSpacer} />
  </Box>
);

type PipelineCardProps = {
  card: PipelineCard;
  onView: (id: string, jobProfileId: string, stage: PipelineStageLabel) => void;
};

const PipelineCardItem = ({ card, onView }: PipelineCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: card.id });

  return (
    <Box
      ref={setNodeRef}
      className={`${styles.pipelineCard} ${styles[`card${card.tone[0].toUpperCase()}${card.tone.slice(1)}`]} ${isDragging ? styles.pipelineCardDragging : ""}`}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      {...attributes}
      {...listeners}
    >
      <Typography component="p" className={styles.pipelineCardTitle}>
        {card.title}
      </Typography>
      <Box className={styles.pipelineCardCompany}>
        <Typography component="span" className={styles.pipelineCardCompanyName}>
          {card.company}
        </Typography>
      </Box>
      <Box className={styles.pipelineCardActions}>
        <ButtonBase
          className={styles.pipelineCardViewBtn}
          onClick={() => onView(card.id, card.jobProfileId, card.stage)}
          disableRipple
          aria-label="View"
        >
          <span className={styles.pipelineCardViewBtnIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M6.5 10H13.5M10.5 7L13.5 10L10.5 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          View
        </ButtonBase>
      </Box>
    </Box>
  );
};

type PipelineColumnDropProps = {
  label: PipelineStageLabel;
  children: React.ReactNode;
};

const PipelineColumnDrop = ({ label, children }: PipelineColumnDropProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: label });

  return (
    <Box
      ref={setNodeRef}
      className={`${styles.pipelineColumn} ${isOver ? styles.pipelineColumnOver : ""}`}
    >
      {children}
    </Box>
  );
};

// ── Pipeline helpers ──────────────────────────────────────────────────

const STAGE_CODE_MAP: Record<string, PipelineStageLabel> = {
  INBOUND: "Inbound",
  SCREENING: "Screening",
  ASSESSMENT: "Assessment",
  INTERVIEW: "Interview",
  SHORTLIST: "Shortlisted",
  OFFER: "Offer",
  CLOSED: "Closed",
};

const STAGE_TONE_MAP: Record<PipelineStageLabel, CardTone> = {
  Inbound: "cream",
  Screening: "lilac",
  Assessment: "yellow",
  Interview: "blush",
  Shortlisted: "ice",
  Offer: "mint",
  Closed: "success",
};

const truncate = (text: string, max = 16) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

const mapUniversalItemToCard = (item: UniversalPipelineItem): PipelineCard | null => {
  const stage = STAGE_CODE_MAP[item.pipelineStatus.toUpperCase()];
  if (!stage) return null;
  return {
    id: item.jobProfileId,
    jobProfileId: item.jobProfileId,
    title: truncate(item.positionTitle),
    company: truncate(item.clientName, 18),
    companyIcon: item.clientName.charAt(0).toUpperCase(),
    tone: STAGE_TONE_MAP[stage],
    stage,
  };
};

const buildColumnsFromApi = (
  items: UniversalPipelineItem[],
  baseColumns: PipelineColumn[],
): PipelineColumn[] => {
  const cardsByStage: Record<PipelineStageLabel, PipelineCard[]> = {
    Inbound: [],
    Screening: [],
    Assessment: [],
    Interview: [],
    Shortlisted: [],
    Offer: [],
    Closed: [],
  };

  for (const item of items) {
    const card = mapUniversalItemToCard(item);
    if (card) {
      cardsByStage[card.stage].push(card);
    }
  }

  return baseColumns.map((col) => ({
    ...col,
    cards: cardsByStage[col.label],
  }));
};

// ── Main Component ────────────────────────────────────────────────────

const CARDS_VISIBLE = 4

const RecruiterPage = () => {
  usePageTitle("Recruiter Dashboard");
  const navigate = useNavigate();
  const { isFirstLogin } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<RecruiterDashboardData | null>(null);
  const [pipelineDashboardStats, setPipelineDashboardStats] =
    useState<PipelineDashboardStats | null>(null);
  const [mandatesData, setMandatesData] =
    useState<RecruiterMandatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [columns, setColumns] = useState<PipelineColumn[]>(PIPELINE_COLUMNS);
  const [allExpanded, setAllExpanded] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const [
          dashboardResponse,
          pipelineDashboardResponse,
          universalPipelinesResponse,
          mandatesResponse,
        ] = await Promise.all([
          mandateApi.getRecruiterDashboard(),
          mandateApi.getPipelineDashboard(),
          mandateApi.listUniversalPipelines({ page: 1, size: 100 }),
          mandateApi.listRecruiterMandates({ page: 1, limit: 12 }),
        ]);

        if (!isActive) {
          return;
        }

        setDashboardData(dashboardResponse.data);
        setPipelineDashboardStats(pipelineDashboardResponse);
        setMandatesData(mandatesResponse.data);
        setColumns(buildColumnsFromApi(universalPipelinesResponse.data, PIPELINE_COLUMNS));
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message =
          typeof error === "object" && error !== null && "message" in error
            ? String(
                (error as { message?: unknown }).message ??
                  "Failed to load recruiter dashboard.",
              )
            : "Failed to load recruiter dashboard.";
        setErrorMessage(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const stageCounts = useMemo(() => {
    const counts: Record<PipelineStageLabel, number> = {
      Inbound: 0,
      Screening: 0,
      Assessment: 0,
      Interview: 0,
      Shortlisted: 0,
      Offer: 0,
      Closed: 0,
    };

    dashboardData?.pipeline.forEach((stage) => {
      const normalized = stage.stage.trim().toLowerCase();
      if (normalized === "inbound") counts.Inbound = stage.count;
      if (normalized === "screening") counts.Screening = stage.count;
      if (normalized === "assessment") counts.Assessment = stage.count;
      if (normalized === "interview") counts.Interview = stage.count;
      if (normalized === "shortlisted") counts.Shortlisted = stage.count;
      if (normalized === "offer") counts.Offer = stage.count;
      if (normalized === "closed") counts.Closed = stage.count;
    });

    return counts;
  }, [dashboardData]);

  const handleNewJobPost = () => {
    navigate(ROUTE_PATHS.recruiterNewJobPost);
  };

  const handleViewMore = () => {
    setAllExpanded(true);
  };

  const handleCardView = (_cardId: string, jobProfileId: string, _stage: PipelineStageLabel) => {
    navigate(ROUTE_PATHS.recruiterMandate.replace(":cardId", jobProfileId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const cardId = String(active.id);
    const targetStage = over.id as PipelineStageLabel;

    setColumns((current) => {
      const sourceColumn = current.find((col) =>
        col.cards.some((card) => card.id === cardId),
      );
      if (!sourceColumn || sourceColumn.label === targetStage) {
        return current;
      }

      const movedCard = sourceColumn.cards.find((card) => card.id === cardId);
      if (!movedCard) {
        return current;
      }

      return current.map((col) => {
        if (col.label === sourceColumn.label) {
          return {
            ...col,
            cards: col.cards.filter((card) => card.id !== cardId),
          };
        }
        if (col.label === targetStage) {
          return {
            ...col,
            cards: [...col.cards, { ...movedCard, stage: targetStage }],
          };
        }
        return col;
      });
    });
  };

  if (loading) {
    return (
      <Box className={styles.shell}>
        <RecruiterSidebar />
        <Box className={styles.pageRoot}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.shell}>
      <RecruiterTour isFirstLogin={isFirstLogin} />
      <RecruiterSidebar />

      <Box className={styles.pageRoot}>
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {/* ── Page Header ── */}
        <Box className={styles.pageHeader}>
          <Typography component="h1" className={styles.pageTitle}>
            Universal Job Pipeline
          </Typography>
          <Button
            variant="contained"
            className={styles.newMandateBtn}
            onClick={handleNewJobPost}
            disableElevation
          >
            New Job Post
          </Button>
        </Box>

        {/* ── Welcome Banner ── */}
        <Box
          component="section"
          className={styles.welcomeBanner}
          data-tour="welcome-banner"
        >
          <Box className={styles.welcomeTextCol}>
            <Typography component="p" className={styles.welcomeGreeting}>
              Hi Michael
            </Typography>
            <Typography component="p" className={styles.welcomeSubtitle}>
              Here's a snapshot of what you need to do this week
            </Typography>
          </Box>
          <Box className={styles.kpiRow}>
            <KpiCard
              value={pipelineDashboardStats?.cvsDue ?? stageCounts.Inbound}
              label="CVs due"
              icon={<CvsDueIcon />}
              colorClass={styles.kpiBlue}
            />
            <KpiCard
              value={pipelineDashboardStats?.interviewsToSchedule ?? stageCounts.Interview}
              label="Interviews to schedule"
              icon={<InterviewsIcon />}
              colorClass={styles.kpiPurple}
            />
            <KpiCard
              value={pipelineDashboardStats?.offerLetterAcceptanceDeadline ?? stageCounts.Offer}
              label="Offer Letter Acceptance Deadlines"
              icon={<OfferLetterIcon />}
              colorClass={styles.kpiAmber}
            />
          </Box>
        </Box>

        {/* ── Recruitment Pipeline ── */}
        <Box component="section" className={styles.pipelineSection}>
          <Typography component="p" className={styles.sectionSubtitle}>
            {pipelineDashboardStats
              ? `${pipelineDashboardStats.activeJobs} active Job Post${pipelineDashboardStats.activeJobs !== 1 ? "s" : ""} across ${pipelineDashboardStats.companiesCount} ${pipelineDashboardStats.companiesCount !== 1 ? "companies" : "company"}`
              : `${mandatesData?.pagination.total ?? 0} active Job Post${(mandatesData?.pagination.total ?? 0) !== 1 ? "s" : ""} across ${new Set(mandatesData?.mandates.map((m) => m.client) ?? []).size} ${new Set(mandatesData?.mandates.map((m) => m.client) ?? []).size !== 1 ? "companies" : "company"}`}
          </Typography>

          <Box className={styles.pipelineWrapper}>
            <Box className={styles.pipelineScroll}>
              {/* Unified header bar */}
              <Box className={styles.pipelineHeader}>
                {columns.map((col) => (
                  <Box key={col.label} className={styles.colHeader}>
                    <Typography component="p" className={styles.colLabel}>
                      {col.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Cards board */}
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <Box className={styles.pipelineBoard}>
                  {columns.map((col) => {
                    const visibleCards = allExpanded ? col.cards : col.cards.slice(0, CARDS_VISIBLE)
                    const hasMore = !allExpanded && col.cards.length > CARDS_VISIBLE
                    return (
                      <PipelineColumnDrop key={col.label} label={col.label}>
                        <Box className={styles.colCards}>
                          {visibleCards.map((card) => (
                            <PipelineCardItem
                              key={card.id}
                              card={card}
                              onView={handleCardView}
                            />
                          ))}
                        </Box>

                        {hasMore && (
                          <ButtonBase
                            className={styles.viewMoreBtn}
                            onClick={handleViewMore}
                            disableRipple
                          >
                            View more
                          </ButtonBase>
                        )}
                      </PipelineColumnDrop>
                    )
                  })}
                </Box>
              </DndContext>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RecruiterPage;