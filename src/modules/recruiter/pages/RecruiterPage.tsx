import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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
import { selectMandate } from "@/store/slices/recruiterPipelineSlice";
import type {
  RecruiterDashboardData,
  RecruiterMandatesData,
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

const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    label: "Inbound",
    colorClass: styles.colInbound,
    cards: [
      {
        id: "c1",
        title: "Senior Develop...",
        company: "Standard Bank",
        companyIcon: "🛡",
        tone: "cream",
        stage: "Inbound",
      },
      {
        id: "c2",
        title: "Accounts Paya...",
        company: "Wexford Searc...",
        companyIcon: "♨",
        tone: "cream",
        stage: "Inbound",
      },
      {
        id: "c3",
        title: "Head of Transp...",
        company: "GIBB Pty Ltd",
        companyIcon: "◉",
        tone: "cream",
        stage: "Inbound",
      },
      {
        id: "c4",
        title: "Academic: Bac...",
        company: "MANCOSA",
        companyIcon: "♜",
        tone: "cream",
        stage: "Inbound",
      },
      {
        id: "c5",
        title: "Banking and Tr...",
        company: "Corporate Place...",
        companyIcon: "✉",
        tone: "cream",
        stage: "Inbound",
      },
    ],
  },
  {
    label: "Screening",
    colorClass: styles.colScreening,
    cards: [
      {
        id: "s1",
        title: "Associate Prof...",
        company: "University of Pret...",
        companyIcon: "♟",
        tone: "lilac",
        stage: "Screening",
      },
      {
        id: "s2",
        title: "QC Analyst - F...",
        company: "Pronto Labour Te...",
        companyIcon: "◉",
        tone: "lilac",
        stage: "Screening",
      },
      {
        id: "s3",
        title: "Chemistry Ana...",
        company: "Microchem Speci...",
        companyIcon: "〽",
        tone: "lilac",
        stage: "Screening",
      },
      {
        id: "s4",
        title: "Junior Mechan...",
        company: "Network Enginee...",
        companyIcon: "◉",
        tone: "lilac",
        stage: "Screening",
      },
      {
        id: "s5",
        title: "Human Resour...",
        company: "University of Kwa...",
        companyIcon: "♟",
        tone: "lilac",
        stage: "Screening",
      },
    ],
  },
  {
    label: "Assessment",
    colorClass: styles.colAssessment,
    cards: [
      {
        id: "a1",
        title: "Associate Prof...",
        company: "University of Pret...",
        companyIcon: "♟",
        tone: "yellow",
        stage: "Assessment",
      },
      {
        id: "a2",
        title: "Driver",
        company: "CYA Global",
        companyIcon: "⚑",
        tone: "yellow",
        stage: "Assessment",
      },
      {
        id: "a3",
        title: "Mechanical En...",
        company: "Ashton Personnel",
        companyIcon: "♙",
        tone: "yellow",
        stage: "Assessment",
      },
      {
        id: "a4",
        title: "Sales Represen...",
        company: "Professional Field...",
        companyIcon: "⚑",
        tone: "yellow",
        stage: "Assessment",
      },
      {
        id: "a5",
        title: "KYC Administra...",
        company: "Moladita Manage...",
        companyIcon: "⚑",
        tone: "yellow",
        stage: "Assessment",
      },
    ],
  },
  {
    label: "Interview",
    colorClass: styles.colInterview,
    cards: [
      {
        id: "i1",
        title: "Logistics Contr...",
        company: "TC Construction",
        companyIcon: "▣",
        tone: "blush",
        stage: "Interview",
      },
      {
        id: "i2",
        title: "Associate Prof...",
        company: "University of Pret...",
        companyIcon: "♟",
        tone: "blush",
        stage: "Interview",
      },
      {
        id: "i3",
        title: "Operations Sys...",
        company: "Network IT",
        companyIcon: "◉",
        tone: "blush",
        stage: "Interview",
      },
      {
        id: "i4",
        title: "Property Valua...",
        company: "Somewhere",
        companyIcon: "S",
        tone: "blush",
        stage: "Interview",
      },
      {
        id: "i5",
        title: "University Degr...",
        company: "Life Healthcare G...",
        companyIcon: "▣",
        tone: "blush",
        stage: "Interview",
      },
    ],
  },
  {
    label: "Shortlisted",
    colorClass: styles.colShortlist,
    cards: [
      {
        id: "sh1",
        title: "Water Treatme...",
        company: "MayFly Agri (pty)...",
        companyIcon: "▣",
        tone: "ice",
        stage: "Shortlisted",
      },
      {
        id: "sh2",
        title: "Experience Acc...",
        company: "Full Service Carto...",
        companyIcon: "⌁",
        tone: "ice",
        stage: "Shortlisted",
      },
      {
        id: "sh3",
        title: "Work Integrate...",
        company: "ATS Testing",
        companyIcon: "◉",
        tone: "ice",
        stage: "Shortlisted",
      },
    ],
  },
  {
    label: "Offer",
    colorClass: styles.colOffer,
    cards: [
      {
        id: "o1",
        title: "Accounts Paya...",
        company: "Communicate Fin...",
        companyIcon: "▣",
        tone: "mint",
        stage: "Offer",
      },
      {
        id: "o2",
        title: "Portfolio Mana...",
        company: "Humankind Group",
        companyIcon: "▣",
        tone: "mint",
        stage: "Offer",
      },
      {
        id: "o3",
        title: "Graduates (Ba...",
        company: "Unique Personnel",
        companyIcon: "♙",
        tone: "mint",
        stage: "Offer",
      },
      {
        id: "o4",
        title: "Banking Adviso...",
        company: "FNB (Private Seg...",
        companyIcon: "▣",
        tone: "mint",
        stage: "Offer",
      },
    ],
  },
  {
    label: "Closed",
    colorClass: styles.colClosed,
    cards: [
      {
        id: "cl1",
        title: "Sales Represen...",
        company: "MASA Outsourc...",
        companyIcon: "▣",
        tone: "success",
        stage: "Closed",
      },
      {
        id: "cl2",
        title: "Sales Represen...",
        company: "MASA Outsourc...",
        companyIcon: "▣",
        tone: "danger",
        stage: "Closed",
      },
      {
        id: "cl3",
        title: "Export Sales S...",
        company: "Luma Consulting",
        companyIcon: "▣",
        tone: "success",
        stage: "Closed",
      },
      {
        id: "cl4",
        title: "Production Eng...",
        company: "Lascom Manage...",
        companyIcon: "▣",
        tone: "success",
        stage: "Closed",
      },
      {
        id: "cl5",
        title: "X3 Junior Grou...",
        company: "Medipost Pharm...",
        companyIcon: "▣",
        tone: "danger",
        stage: "Closed",
      },
    ],
  },
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
  onView: () => void;
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
  onView: (id: string, stage: PipelineStageLabel) => void;
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
          onClick={() => onView(card.id, card.stage)}
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

// ── Main Component ────────────────────────────────────────────────────

const RecruiterPage = () => {
  usePageTitle("Recruiter Dashboard");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isFirstLogin } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<RecruiterDashboardData | null>(null);
  const [mandatesData, setMandatesData] =
    useState<RecruiterMandatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [columns, setColumns] = useState<PipelineColumn[]>(PIPELINE_COLUMNS);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const [dashboardResponse, mandatesResponse] = await Promise.all([
          mandateApi.getRecruiterDashboard(),
          mandateApi.listRecruiterMandates({ page: 1, limit: 12 }),
        ]);

        if (!isActive) {
          return;
        }

        setDashboardData(dashboardResponse.data);
        setMandatesData(mandatesResponse.data);
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

  const defaultMandateId = PIPELINE_COLUMNS[0]?.cards[0]?.id ?? "c1";

  const handleNewJobPost = () => {
    navigate(ROUTE_PATHS.recruiterNewJobPost);
  };

  const handleViewCvsDue = () => {
    dispatch(selectMandate(defaultMandateId));
    navigate(ROUTE_PATHS.recruiterMandate.replace(":cardId", defaultMandateId));
  };

  const handleViewInterviews = () => {
    dispatch(selectMandate(defaultMandateId));
    navigate(ROUTE_PATHS.recruiterMandate.replace(":cardId", defaultMandateId));
  };

  const handleViewOfferLetters = () => {
    dispatch(selectMandate(defaultMandateId));
    navigate(ROUTE_PATHS.recruiterMandate.replace(":cardId", defaultMandateId));
  };

  const handleViewMore = () => {
    navigate(ROUTE_PATHS.recruiterDashboard);
  };

  const handleCardView = (cardId: string, stage: PipelineStageLabel) => {
    // For Inbound stage, navigate to Mandate Details with full data
    if (stage === "Inbound") {
      dispatch(selectMandate(cardId));
      navigate(ROUTE_PATHS.recruiterMandate.replace(":cardId", cardId));
    }
    // Other stages: future implementation
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
              value={stageCounts.Inbound}
              label="CVs due"
              icon={<CvsDueIcon />}
              colorClass={styles.kpiBlue}
              onView={handleViewCvsDue}
            />
            <KpiCard
              value={stageCounts.Interview}
              label="Interviews to schedule"
              icon={<InterviewsIcon />}
              colorClass={styles.kpiPurple}
              onView={handleViewInterviews}
            />
            <KpiCard
              value={stageCounts.Offer}
              label="Offer Letter Acceptance Deadlines"
              icon={<OfferLetterIcon />}
              colorClass={styles.kpiAmber}
              onView={handleViewOfferLetters}
            />
          </Box>
        </Box>

        {/* ── Recruitment Pipeline ── */}
        <Box component="section" className={styles.pipelineSection}>
          <Typography component="p" className={styles.sectionSubtitle}>
            {`${mandatesData?.pagination.total ?? 0} active Job Post${(mandatesData?.pagination.total ?? 0) !== 1 ? 's' : ''} across ${new Set(mandatesData?.mandates.map((m) => m.client) ?? []).size} ${new Set(mandatesData?.mandates.map((m) => m.client) ?? []).size !== 1 ? 'companies' : 'company'}`}
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
                  {columns.map((col) => (
                    <PipelineColumnDrop key={col.label} label={col.label}>
                      <Box className={styles.colCards}>
                        {col.cards.map((card) => (
                          <PipelineCardItem
                            key={card.id}
                            card={card}
                            onView={handleCardView}
                          />
                        ))}
                      </Box>

                      <ButtonBase
                        className={styles.viewMoreBtn}
                        onClick={handleViewMore}
                        disableRipple
                      >
                        View more
                      </ButtonBase>
                    </PipelineColumnDrop>
                  ))}
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