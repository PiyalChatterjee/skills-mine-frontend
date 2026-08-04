import { Box, Button, ButtonBase, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
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
  companyColor: string
}

// ── Constants ─────────────────────────────────────────────────────────

const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    label: 'Inbound',
    count: 15,
    colorClass: styles.colInbound,
    cards: [
      { id: 'c1', title: 'Senior Develop...', company: 'Standard Bank', companyColor: '#1a73c5' },
      { id: 'c2', title: 'Accounts Paya...', company: 'Wexford Searc...', companyColor: '#3aa86e' },
      { id: 'c3', title: 'Head of Transp...', company: 'GIBB Pty Ltd', companyColor: '#e07d3a' },
      { id: 'c4', title: 'Academic: Bac...', company: 'MANCOSA', companyColor: '#c0392b' },
      { id: 'c5', title: 'Banking and Tr...', company: 'Corporate Place...', companyColor: '#1a73c5' },
    ],
  },
  {
    label: 'Screening',
    count: 8,
    colorClass: styles.colScreening,
    cards: [
      { id: 's1', title: 'Associate Prof...', company: 'University of Pret...', companyColor: '#6c4fa3' },
      { id: 's2', title: 'QC Analyst – F...', company: 'Pronto Labour Te...', companyColor: '#3aa86e' },
      { id: 's3', title: 'Chemistry Ana...', company: 'Microchem Speci...', companyColor: '#3aa86e' },
      { id: 's4', title: 'Junior Mechan...', company: 'Network Enginee...', companyColor: '#c0392b' },
      { id: 's5', title: 'Human Resour...', company: 'University of Kwa...', companyColor: '#6c4fa3' },
    ],
  },
  {
    label: 'Assessment',
    count: 16,
    colorClass: styles.colAssessment,
    cards: [
      { id: 'a1', title: 'Associate Prof...', company: 'University of Pret...', companyColor: '#6c4fa3' },
      { id: 'a2', title: 'Driver', company: 'CYA Global', companyColor: '#1a73c5' },
      { id: 'a3', title: 'Mechanical En...', company: 'Ashton Personnel', companyColor: '#3aa86e' },
      { id: 'a4', title: 'Sales Represen...', company: 'Professional Field...', companyColor: '#1a73c5' },
      { id: 'a5', title: 'KYC Administra...', company: 'Moladita Manage...', companyColor: '#3aa86e' },
    ],
  },
  {
    label: 'Interview',
    count: 7,
    colorClass: styles.colInterview,
    cards: [
      { id: 'i1', title: 'Logistics Contr...', company: 'TC Construction', companyColor: '#3aa86e' },
      { id: 'i2', title: 'Associate Prof...', company: 'University of Pret...', companyColor: '#6c4fa3' },
      { id: 'i3', title: 'Operations Sys...', company: 'Network IT', companyColor: '#3aa86e' },
      { id: 'i4', title: 'Property Valua...', company: 'Somewhere', companyColor: '#9e9e9e' },
      { id: 'i5', title: 'University Degr...', company: 'Life Healthcare G...', companyColor: '#3aa86e' },
    ],
  },
  {
    label: 'Shortlist',
    count: 3,
    colorClass: styles.colShortlist,
    cards: [
      { id: 'sh1', title: 'Water Treatme...', company: 'MayFly Agri (pty)...', companyColor: '#3aa86e' },
      { id: 'sh2', title: 'Experience Acc...', company: 'Full Service Carto...', companyColor: '#3aa86e' },
      { id: 'sh3', title: 'Work Integrate...', company: 'Unique Personnel', companyColor: '#1a73c5' },
    ],
  },
  {
    label: 'Offer',
    count: 4,
    colorClass: styles.colOffer,
    cards: [
      { id: 'o1', title: 'Accounts Paya...', company: 'Communicate Fin...', companyColor: '#3aa86e' },
      { id: 'o2', title: 'Portfolio Mana...', company: 'Humankind Group', companyColor: '#3aa86e' },
      { id: 'o3', title: 'Graduates (Ba...', company: 'Liona Consulting', companyColor: '#1a73c5' },
      { id: 'o4', title: 'Banking Adviso...', company: 'FNB (Private Seg...', companyColor: '#c0392b' },
    ],
  },
  {
    label: 'Closed',
    count: 50,
    colorClass: styles.colClosed,
    cards: [
      { id: 'cl1', title: 'Sales Represen...', company: 'MASA Outsourc...', companyColor: '#c0392b' },
      { id: 'cl2', title: 'Sales Represen...', company: 'MASA Outsourc...', companyColor: '#c0392b' },
      { id: 'cl3', title: 'Export Sales S...', company: 'Liona Consulting', companyColor: '#1a73c5' },
      { id: 'cl4', title: 'Production Eng...', company: 'Lapcim Manage...', companyColor: '#3aa86e' },
      { id: 'cl5', title: 'X3 Junior Grou...', company: 'Medipost Pharm...', companyColor: '#3aa86e' },
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
  onView: () => void
  onExpand: () => void
}

const PipelineCardItem = ({ card, onView, onExpand }: PipelineCardProps) => (
  <Box className={styles.pipelineCard}>
    <Typography component="p" className={styles.pipelineCardTitle}>{card.title}</Typography>
    <Box className={styles.pipelineCardCompany}>
      <Box
        className={styles.pipelineCardCompanyDot}
        style={{ background: card.companyColor }}
      />
      <Typography component="span" className={styles.pipelineCardCompanyName}>
        {card.company}
      </Typography>
    </Box>
    <Box className={styles.pipelineCardActions}>
      <ButtonBase className={styles.pipelineCardActionBtn} onClick={onView} disableRipple aria-label="View">
        👁
      </ButtonBase>
      <ButtonBase className={styles.pipelineCardActionBtn} onClick={onExpand} disableRipple aria-label="Expand">
        ⤢
      </ButtonBase>
    </Box>
  </Box>
)

// ── Main Component ────────────────────────────────────────────────────

const RecruiterPage = () => {
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

  const handleCardView = () => {
    // TODO: Navigate to card detail view
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

        <Box className={styles.pipelineBoard}>
          {PIPELINE_COLUMNS.map((col) => (
            <Box key={col.label} className={styles.pipelineColumn}>
              {/* Column Header */}
              <Box className={`${styles.colHeader} ${col.colorClass}`}>
                <Typography component="p" className={styles.colLabel}>{col.label}</Typography>
                <Typography component="p" className={styles.colCount}>{col.count}</Typography>
              </Box>

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
  )
}

export default RecruiterPage
