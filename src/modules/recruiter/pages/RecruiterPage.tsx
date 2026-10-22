import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useMancoRecruiterDetail } from "@/modules/recruiter/hooks/useMancoDashboard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/app/auth/AuthContext";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { mandateApi } from "@/services/api/mandateApi";
import cvsDueIcon from "@/assets/recruiter/cvs-due.svg";
import interviewsIcon from "@/assets/recruiter/interviews.svg";
import offerLetterIcon from "@/assets/recruiter/offer-letter.svg";
import type {
  PipelineDashboardStats,
  PipelineApplication,
  PipelinesListData,
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
  | "Shortlist"
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
  { label: "Inbound", colorClass: styles.colInbound, cards: [] },
  { label: "Screening", colorClass: styles.colScreening, cards: [] },
  { label: "Assessment", colorClass: styles.colAssessment, cards: [] },
  { label: "Interview", colorClass: styles.colInterview, cards: [] },
  { label: "Shortlist", colorClass: styles.colShortlist, cards: [] },
  { label: "Offer", colorClass: styles.colOffer, cards: [] },
  { label: "Closed", colorClass: styles.colClosed, cards: [] },
];

// ── Sub-components ────────────────────────────────────────────────────

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
          <span className={styles.pipelineCardViewBtnIcon} aria-hidden="true" />
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
  SHORTLIST: "Shortlist",
  OFFER: "Offer",
  CLOSED: "Closed",
};

const STAGE_TONE_MAP: Record<PipelineStageLabel, CardTone> = {
  Inbound: "cream",
  Screening: "lilac",
  Assessment: "yellow",
  Interview: "blush",
  Shortlist: "ice",
  Offer: "mint",
  Closed: "success",
};

const truncate = (text: string, max = 16) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

const mapUniversalItemToCard = (
  item: UniversalPipelineItem,
): PipelineCard | null => {
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
    Shortlist: [],
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

export const buildColumnsFromApplications = (
  applications: PipelineApplication[],
  baseColumns: PipelineColumn[],
): PipelineColumn[] => {
  const cardsByStage: Record<PipelineStageLabel, PipelineCard[]> = {
    Inbound: [],
    Screening: [],
    Assessment: [],
    Interview: [],
    Shortlist: [],
    Offer: [],
    Closed: [],
  };
  const seenJobProfileIds = new Set<string>();

  for (const application of applications) {
    const stage = STAGE_CODE_MAP[application.currentStageCode.toUpperCase()];
    const jobProfileId = application.jobProfile.jobProfileId;
    if (!stage || seenJobProfileIds.has(jobProfileId)) {
      continue;
    }
    seenJobProfileIds.add(jobProfileId);

    cardsByStage[stage].push({
      id: jobProfileId,
      jobProfileId,
      title: truncate(application.jobProfile.positionTitle),
      company: truncate(application.jobProfile.clientName, 18),
      companyIcon: application.jobProfile.clientName.charAt(0).toUpperCase(),
      tone: STAGE_TONE_MAP[stage],
      stage,
    });
  }

  return baseColumns.map((column) => ({
    ...column,
    cards: cardsByStage[column.label],
  }));
};

// ── Main Component ────────────────────────────────────────────────────

const CARDS_VISIBLE = 4;

const RecruiterPage = () => {
  const { recruiterId } = useParams<{ recruiterId?: string }>();
  const employeeQuery = useMancoRecruiterDetail(
    recruiterId ?? "",
    Boolean(recruiterId),
  );
  usePageTitle(recruiterId ? "Recruitment Pipeline" : "Recruiter Dashboard");
  const navigate = useNavigate();
  const { isFirstLogin } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<RecruiterDashboardData | null>(null);
  const [pipelineDashboardStats, setPipelineDashboardStats] =
    useState<PipelineDashboardStats | null>(null);
  const [mandatesData, setMandatesData] =
    useState<RecruiterMandatesData | null>(null);
  const [employeePipelineData, setEmployeePipelineData] =
    useState<PipelinesListData | null>(null);
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
        setEmployeePipelineData(null);

        if (recruiterId) {
          const pipelineResponse = await mandateApi.listPipelines({
            recruiterId,
            page: 1,
            size: 100,
          });

          if (!isActive) {
            return;
          }

          setEmployeePipelineData(pipelineResponse);
          setColumns(
            buildColumnsFromApplications(
              pipelineResponse.data,
              PIPELINE_COLUMNS,
            ),
          );
          return;
        }

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
        setColumns(
          buildColumnsFromApi(
            universalPipelinesResponse.data,
            PIPELINE_COLUMNS,
          ),
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message =
          typeof error === "object" && error !== null && "message" in error
            ? String(
                (error as { message?: unknown }).message ??
                  `Failed to load ${recruiterId ? "recruiter pipeline" : "recruiter dashboard"}.`,
              )
            : `Failed to load ${recruiterId ? "recruiter pipeline" : "recruiter dashboard"}.`;
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
  }, [recruiterId]);

  const stageCounts = useMemo(() => {
    const counts: Record<PipelineStageLabel, number> = {
      Inbound: 0,
      Screening: 0,
      Assessment: 0,
      Interview: 0,
      Shortlist: 0,
      Offer: 0,
      Closed: 0,
    };

    dashboardData?.pipeline.forEach((stage) => {
      const normalized = stage.stage.trim().toLowerCase();
      if (normalized === "inbound") counts.Inbound = stage.count;
      if (normalized === "screening") counts.Screening = stage.count;
      if (normalized === "assessment") counts.Assessment = stage.count;
      if (normalized === "interview") counts.Interview = stage.count;
      if (normalized === "shortlisted" || normalized === "shortlist")
        counts.Shortlist = stage.count;
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

  const handleCardView = (
    _cardId: string,
    jobProfileId: string,
    _stage: PipelineStageLabel,
  ) => {
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

  if (loading || (recruiterId && employeeQuery.isLoading)) {
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
      {!recruiterId && <RecruiterTour isFirstLogin={isFirstLogin} />}
      <RecruiterSidebar />

      <Box
        className={`${styles.pageRoot} ${recruiterId ? styles.employeePipelinePage : ""}`}
      >
        {recruiterId && (
          <Box
            component="nav"
            aria-label="Breadcrumb"
            className={styles.employeeBreadcrumbs}
          >
            <ButtonBase
              className={styles.employeeBackButton}
              onClick={() => navigate(ROUTE_PATHS.recruiterManco)}
              disableRipple
            >
              Back
            </ButtonBase>
            <ButtonBase
              className={styles.employeeBreadcrumbLink}
              onClick={() => navigate(ROUTE_PATHS.recruiterManco)}
              disableRipple
            >
              MANCO Dashboard
            </ButtonBase>
            <Box
              className={styles.employeeBreadcrumbChevron}
              aria-hidden="true"
            />
            <Typography
              className={styles.employeeBreadcrumbCurrent}
              aria-current="page"
            >
              {`${employeeQuery.data?.recruiter.fullName ?? "Employee"}'s Recruitment Pipeline`}
            </Typography>
          </Box>
        )}
        {(errorMessage || (recruiterId && employeeQuery.isError)) && (
          <Alert severity="error">
            {errorMessage ?? "Recruiter details could not be loaded."}
          </Alert>
        )}
        {!recruiterId && (
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
        )}

        {/* ── Welcome Banner ── */}
        <Box
          component="section"
          className={styles.welcomeBanner}
          data-tour="welcome-banner"
        >
          <Box className={styles.welcomeTextCol}>
            <Typography component="p" className={styles.welcomeGreeting}>
              Hi{" "}
              {recruiterId
                ? (employeeQuery.data?.recruiter.fullName.split(" ")[0] ?? "")
                : ""}
            </Typography>
            <Typography component="p" className={styles.welcomeSubtitle}>
              Here's a snapshot of what you need to do this week
            </Typography>
          </Box>
          <Box className={styles.kpiRow}>
            <KpiCard
              value={
                employeePipelineData?.stageCounters.INBOUND ??
                pipelineDashboardStats?.cvsDue ??
                stageCounts.Inbound
              }
              label={recruiterId ? "CVs to screen" : "CVs due"}
              icon={<img src={cvsDueIcon} width={22} height={22} alt="" />}
              colorClass={styles.kpiBlue}
            />
            <KpiCard
              value={
                employeePipelineData?.stageCounters.INTERVIEW ??
                pipelineDashboardStats?.interviewsToSchedule ??
                stageCounts.Interview
              }
              label="Interviews to schedule"
              icon={<img src={interviewsIcon} width={22} height={22} alt="" />}
              colorClass={styles.kpiPurple}
            />
            <KpiCard
              value={
                employeePipelineData?.stageCounters.OFFER ??
                pipelineDashboardStats?.offerLetterAcceptanceDeadline ??
                stageCounts.Offer
              }
              label="Offer Letter Acceptance Deadlines"
              icon={<img src={offerLetterIcon} width={22} height={22} alt="" />}
              colorClass={styles.kpiAmber}
            />
          </Box>
        </Box>

        {/* ── Recruitment Pipeline ── */}
        <Box component="section" className={styles.pipelineSection}>
          <Typography component="p" className={styles.sectionSubtitle}>
            {employeePipelineData
              ? `${new Set(employeePipelineData.data.map((application) => application.jobProfile.jobProfileId)).size} active Job Post${new Set(employeePipelineData.data.map((application) => application.jobProfile.jobProfileId)).size !== 1 ? "s" : ""} across ${new Set(employeePipelineData.data.map((application) => application.jobProfile.clientId)).size} ${new Set(employeePipelineData.data.map((application) => application.jobProfile.clientId)).size !== 1 ? "companies" : "company"}`
              : pipelineDashboardStats
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
                    const visibleCards = allExpanded
                      ? col.cards
                      : col.cards.slice(0, CARDS_VISIBLE);
                    const hasMore =
                      !allExpanded && col.cards.length > CARDS_VISIBLE;
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
                    );
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
