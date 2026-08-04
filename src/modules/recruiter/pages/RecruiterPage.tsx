import { useNavigate } from 'react-router-dom'
import { Box, Button, ButtonBase, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './RecruiterPage.module.css'

// ── Types ─────────────────────────────────────────────────────────────

type PipelineColumn = {
  label: string
  count: number
  colorClass: string
  cards: PipelineCard[]
}

type PipelineCard = {
  id: string
  title: string
  company: string
  companyIcon: string
  tone: 'cream' | 'lilac' | 'yellow' | 'blush' | 'ice' | 'mint' | 'success' | 'danger'
}

// ── Constants ─────────────────────────────────────────────────────────

const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    label: 'Inbound',
    count: 15,
    colorClass: styles.colInbound,
    cards: [
      { id: 'c1', title: 'Senior Develop...', company: 'Standard Bank', companyIcon: '🛡', tone: 'cream' },
      { id: 'c2', title: 'Accounts Paya...', company: 'Wexford Searc...', companyIcon: '♨', tone: 'cream' },
      { id: 'c3', title: 'Head of Transp...', company: 'GIBB Pty Ltd', companyIcon: '◉', tone: 'cream' },
      { id: 'c4', title: 'Academic: Bac...', company: 'MANCOSA', companyIcon: '♜', tone: 'cream' },
      { id: 'c5', title: 'Banking and Tr...', company: 'Corporate Place...', companyIcon: '✉', tone: 'cream' },
    ],
  },
  {
    label: 'Screening',
    count: 8,
    colorClass: styles.colScreening,
    cards: [
      { id: 's1', title: 'Associate Prof...', company: 'University of Pret...', companyIcon: '♟', tone: 'lilac' },
      { id: 's2', title: 'QC Analyst - F...', company: 'Pronto Labour Te...', companyIcon: '◉', tone: 'lilac' },
      { id: 's3', title: 'Chemistry Ana...', company: 'Microchem Speci...', companyIcon: '〽', tone: 'lilac' },
      { id: 's4', title: 'Junior Mechan...', company: 'Network Enginee...', companyIcon: '◉', tone: 'lilac' },
      { id: 's5', title: 'Human Resour...', company: 'University of Kwa...', companyIcon: '♟', tone: 'lilac' },
    ],
  },
  {
    label: 'Assessment',
    count: 16,
    colorClass: styles.colAssessment,
    cards: [
      { id: 'a1', title: 'Associate Prof...', company: 'University of Pret...', companyIcon: '♟', tone: 'yellow' },
      { id: 'a2', title: 'Driver', company: 'CYA Global', companyIcon: '⚑', tone: 'yellow' },
      { id: 'a3', title: 'Mechanical En...', company: 'Ashton Personnel', companyIcon: '♙', tone: 'yellow' },
      { id: 'a4', title: 'Sales Represen...', company: 'Professional Field...', companyIcon: '⚑', tone: 'yellow' },
      { id: 'a5', title: 'KYC Administra...', company: 'Moladita Manage...', companyIcon: '⚑', tone: 'yellow' },
    ],
  },
  {
    label: 'Interview',
    count: 7,
    colorClass: styles.colInterview,
    cards: [
      { id: 'i1', title: 'Logistics Contr...', company: 'TC Construction', companyIcon: '▣', tone: 'blush' },
      { id: 'i2', title: 'Associate Prof...', company: 'University of Pret...', companyIcon: '♟', tone: 'blush' },
      { id: 'i3', title: 'Operations Sys...', company: 'Network IT', companyIcon: '◉', tone: 'blush' },
      { id: 'i4', title: 'Property Valua...', company: 'Somewhere', companyIcon: 'S', tone: 'blush' },
      { id: 'i5', title: 'University Degr...', company: 'Life Healthcare G...', companyIcon: '▣', tone: 'blush' },
    ],
  },
  {
    label: 'Shortlist',
    count: 3,
    colorClass: styles.colShortlist,
    cards: [
      { id: 'sh1', title: 'Water Treatme...', company: 'MayFly Agri (pty)...', companyIcon: '▣', tone: 'ice' },
      { id: 'sh2', title: 'Experience Acc...', company: 'Full Service Carto...', companyIcon: '⌁', tone: 'ice' },
      { id: 'sh3', title: 'Work Integrate...', company: 'ATS Testing', companyIcon: '◉', tone: 'ice' },
    ],
  },
  {
    label: 'Offer',
    count: 4,
    colorClass: styles.colOffer,
    cards: [
      { id: 'o1', title: 'Accounts Paya...', company: 'Communicate Fin...', companyIcon: '▣', tone: 'mint' },
      { id: 'o2', title: 'Portfolio Mana...', company: 'Humankind Group', companyIcon: '▣', tone: 'mint' },
      { id: 'o3', title: 'Graduates (Ba...', company: 'Unique Personnel', companyIcon: '♙', tone: 'mint' },
      { id: 'o4', title: 'Banking Adviso...', company: 'FNB (Private Seg...', companyIcon: '▣', tone: 'mint' },
    ],
  },
  {
    label: 'Closed',
    count: 50,
    colorClass: styles.colClosed,
    cards: [
      { id: 'cl1', title: 'Sales Represen...', company: 'MASA Outsourc...', companyIcon: '▣', tone: 'success' },
      { id: 'cl2', title: 'Sales Represen...', company: 'MASA Outsourc...', companyIcon: '▣', tone: 'danger' },
      { id: 'cl3', title: 'Export Sales S...', company: 'Luma Consulting', companyIcon: '▣', tone: 'success' },
      { id: 'cl4', title: 'Production Eng...', company: 'Lascom Manage...', companyIcon: '▣', tone: 'success' },
      { id: 'cl5', title: 'X3 Junior Grou...', company: 'Medipost Pharm...', companyIcon: '▣', tone: 'danger' },
    ],
  },
]

// ── Sub-components ────────────────────────────────────────────────────

// ── KPI card icons ────────────────────────────────────────────────────

const CvsDueIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const InterviewsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const OfferLetterIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ── KPI Card ──────────────────────────────────────────────────────────

type KpiCardProps = {
  value: number
  label: string
  icon: React.ReactNode
  colorClass: string
  onView: () => void
}

const KpiCard = ({ value, label, icon, colorClass, onView }: KpiCardProps) => (
  <Box className={`${styles.kpiCard} ${colorClass}`}>
    <Box className={styles.kpiTop}>
      <Typography component="p" className={styles.kpiValue}>{value}</Typography>
      <Box className={styles.kpiIcon} aria-hidden="true">{icon}</Box>
    </Box>
    <Typography component="p" className={styles.kpiLabel}>{label}</Typography>
    <Box className={styles.kpiSpacer} />
    <Box className={styles.kpiDivider} />
    <ButtonBase className={styles.kpiViewBtn} onClick={onView} disableRipple>
      View →
    </ButtonBase>
  </Box>
)

type PipelineCardProps = {
  card: PipelineCard
  onView: (id: string) => void
  onExpand: () => void
}

const PipelineCardItem = ({ card, onView, onExpand }: PipelineCardProps) => (
  <Box className={`${styles.pipelineCard} ${styles[`card${card.tone[0].toUpperCase()}${card.tone.slice(1)}`]}`}>
    <Typography component="p" className={styles.pipelineCardTitle}>{card.title}</Typography>
    <Box className={styles.pipelineCardCompany}>
      <Box component="span" className={styles.pipelineCardCompanyIcon}>{card.companyIcon}</Box>
      <Typography component="span" className={styles.pipelineCardCompanyName}>
        {card.company}
      </Typography>
    </Box>
    <Box className={styles.pipelineCardActions}>
      <ButtonBase className={styles.pipelineCardActionBtn} onClick={() => onView(card.id)} disableRipple aria-label="View">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M9.99993 2.5C14.4933 2.5 18.2317 5.73313 19.0154 10C18.2317 14.2668 14.4933 17.5 9.99993 17.5C5.50644 17.5 1.76813 14.2668 0.984375 10C1.76813 5.73313 5.50644 2.5 9.99993 2.5ZM9.99993 15.8333C13.5296 15.8333 16.5499 13.3767 17.3144 10C16.5499 6.62336 13.5296 4.16667 9.99993 4.16667C6.47018 4.16667 3.44986 6.62336 2.68533 10C3.44986 13.3767 6.47018 15.8333 9.99993 15.8333ZM9.99993 13.75C7.92883 13.75 6.24989 12.0711 6.24989 10C6.24989 7.92893 7.92883 6.25 9.99993 6.25C12.0709 6.25 13.7499 7.92893 13.7499 10C13.7499 12.0711 12.0709 13.75 9.99993 13.75ZM9.99993 12.0833C11.1505 12.0833 12.0833 11.1506 12.0833 10C12.0833 8.84942 11.1505 7.91667 9.99993 7.91667C8.84934 7.91667 7.91656 8.84942 7.91656 10C7.91656 11.1506 8.84934 12.0833 9.99993 12.0833Z" fill="currentColor"/>
        </svg>
      </ButtonBase>
      <ButtonBase className={styles.pipelineCardActionBtn} onClick={onExpand} disableRipple aria-label="Expand">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" /></svg>
      </ButtonBase>
    </Box>
  </Box>
)

// ── Main Component ────────────────────────────────────────────────────

const RecruiterPage = () => {
  const navigate = useNavigate()

  const handleNewMandate = () => {
    // TODO: Implement new mandate action
  }

  const handleViewCvsDue = () => {
    // TODO: Navigate to CVs due view
  }

  const handleViewInterviews = () => {
    // TODO: Navigate to interviews to schedule
  }

  const handleViewOfferLetters = () => {
    // TODO: Navigate to offer letter deadlines
  }

  const handleViewMore = () => {
    // TODO: Navigate to full pipeline column view
  }

  const handleCardView = (cardId: string) => {
    navigate(ROUTE_PATHS.recruiterMandate.replace(':cardId', cardId))
  }

  const handleCardExpand = () => {
    // TODO: Open card expand/detail panel
  }

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />

      <Box className={styles.pageRoot}>
      {/* ── Page Header ── */}
      <Box className={styles.pageHeader}>
        <Typography component="h1" className={styles.pageTitle}>
          Recruiter Dashboard
        </Typography>
        <Button
          variant="contained"
          className={styles.newMandateBtn}
          onClick={handleNewMandate}
          disableElevation
        >
          New Mandate
        </Button>
      </Box>

      {/* ── Welcome Banner ── */}
      <Box component="section" className={styles.welcomeBanner}>
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
            value={20}
            label="CVs due"
            icon={<CvsDueIcon />}
            colorClass={styles.kpiBlue}
            onView={handleViewCvsDue}
          />
          <KpiCard
            value={5}
            label="Interviews to schedule"
            icon={<InterviewsIcon />}
            colorClass={styles.kpiPurple}
            onView={handleViewInterviews}
          />
          <KpiCard
            value={10}
            label="Offer Letter Acceptance Deadlines"
            icon={<OfferLetterIcon />}
            colorClass={styles.kpiAmber}
            onView={handleViewOfferLetters}
          />
        </Box>
      </Box>

      {/* ── Recruitment Pipeline ── */}
      <Box component="section" className={styles.pipelineSection}>
        <Typography component="h2" className={styles.sectionTitle}>
          Recruitment Pipeline
        </Typography>
        <Typography component="p" className={styles.sectionSubtitle}>
          53 active mandates across 30 companies
        </Typography>

        <Box className={styles.pipelineWrapper}>
          {/* Unified header bar */}
          <Box className={styles.pipelineHeader}>
            {PIPELINE_COLUMNS.map((col) => (
              <Box key={col.label} className={styles.colHeader}>
                <Typography component="p" className={styles.colLabel}>{col.label}</Typography>
                <Typography component="p" className={styles.colCount}>{col.count}</Typography>
              </Box>
            ))}
          </Box>

          {/* Cards board */}
          <Box className={styles.pipelineBoard}>
            {PIPELINE_COLUMNS.map((col) => (
              <Box key={col.label} className={styles.pipelineColumn}>
                {/* Cards */}
                <Box className={styles.colCards}>
                  {col.cards.map((card) => (
                    <PipelineCardItem
                      key={card.id}
                      card={card}
                      onView={handleCardView}
                      onExpand={handleCardExpand}
                    />
                  ))}
                </Box>

                {/* View More */}
                <ButtonBase
                  className={styles.viewMoreBtn}
                  onClick={handleViewMore}
                  disableRipple
                >
                  View more
                </ButtonBase>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      </Box>
    </Box>
  )
}

export default RecruiterPage
