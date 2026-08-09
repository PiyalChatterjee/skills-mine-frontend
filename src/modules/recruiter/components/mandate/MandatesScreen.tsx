import { Box, Button, ButtonBase, Typography } from '@mui/material'
import styles from './MandatesScreen.module.css'

type MandateStatus = 'Posted' | 'Draft'

type MandateRow = {
  id: string
  company: string
  logoText: string
  title: string
  industry: string
  location: string
  timeline: string
  status: MandateStatus
  logoClassName: string
}

type MandatesScreenProps = {
  onNewMandate: () => void
}

const MANDATE_ROWS: MandateRow[] = [
  {
    id: 'm1',
    company: 'BuildRight',
    logoText: 'BR',
    title: 'Project Manager',
    industry: 'Education',
    location: 'Johannesburg',
    timeline: '1 Jan 2026 - 1 Feb 2026',
    status: 'Posted',
    logoClassName: styles.logoBuildRight,
  },
  {
    id: 'm2',
    company: 'CodeMasters',
    logoText: 'CM',
    title: 'Software Engineer',
    industry: 'Information Technology',
    location: 'Cape Town',
    timeline: '1 Dec 2025 - 18 Jan 2026',
    status: 'Draft',
    logoClassName: styles.logoCodeMasters,
  },
  {
    id: 'm3',
    company: 'Creative Minds',
    logoText: 'CM',
    title: 'Content Strategist',
    industry: 'Digital Marketing',
    location: 'Cape Town',
    timeline: '1 Dec 2025 - 18 Jan 2026',
    status: 'Posted',
    logoClassName: styles.logoCreativeMinds,
  },
  {
    id: 'm4',
    company: 'DesignHub',
    logoText: 'hub',
    title: 'Graphic Designer',
    industry: 'Creative',
    location: 'Durban',
    timeline: '1 Feb 2026 - 1 Mar 2026',
    status: 'Posted',
    logoClassName: styles.logoDesignHub,
  },
  {
    id: 'm5',
    company: 'HELM',
    logoText: 'HELM',
    title: 'UX Designer',
    industry: 'Digital Marketing',
    location: 'Cape Town',
    timeline: '1 Nov 2025 - 19 Dec 2025',
    status: 'Posted',
    logoClassName: styles.logoHelm,
  },
  {
    id: 'm6',
    company: 'Insight Partners',
    logoText: 'IP',
    title: 'Business Analyst',
    industry: 'Banking',
    location: 'Johannesburg',
    timeline: '1 Jan 2026 - 1 Feb 2026',
    status: 'Posted',
    logoClassName: styles.logoInsightPartners,
  },
  {
    id: 'm7',
    company: 'InvestPro',
    logoText: 'INV',
    title: 'Data Analyst',
    industry: 'Manufacturing',
    location: 'Johannesburg',
    timeline: '1 Nov 2025 - 19 Dec 2025',
    status: 'Posted',
    logoClassName: styles.logoInvestPro,
  },
  {
    id: 'm8',
    company: 'LogiTech',
    logoText: 'logi',
    title: 'Logistics Coordinator',
    industry: 'Supply Chain',
    location: 'Pretoria',
    timeline: '5 Jan 2026 - 28 Feb 2026',
    status: 'Posted',
    logoClassName: styles.logoLogiTech,
  },
]

export const MandatesScreen = ({ onNewMandate }: MandatesScreenProps) => (
  <Box className={styles.pageRoot}>
    <Box className={styles.pageHeader}>
      <Typography component="h1" className={styles.pageTitle}>
        Mandates
      </Typography>
      <Button
        variant="contained"
        className={styles.newMandateBtn}
        onClick={onNewMandate}
        disableElevation
      >
        New Mandate
      </Button>
    </Box>

    <Box className={styles.filtersRow}>
      <ButtonBase className={styles.filterChip} disableRipple>
        <Box component="span" className={styles.filterChipIcon} aria-hidden="true">⌂</Box>
        Company
      </ButtonBase>
      <ButtonBase className={styles.filterChip} disableRipple>
        <Box component="span" className={styles.filterChipIcon} aria-hidden="true">⌖</Box>
        Location
      </ButtonBase>
      <ButtonBase className={styles.filterChip} disableRipple>
        <Box component="span" className={styles.filterChipIcon} aria-hidden="true">○</Box>
        Status
      </ButtonBase>
      <Box className={styles.searchField}>
        <Box component="span" className={styles.filterChipIcon} aria-hidden="true">⌕</Box>
        <Typography component="span" className={styles.searchPlaceholder}>
          Search job posts
        </Typography>
      </Box>
    </Box>

    <Box className={styles.tableWrap}>
      <Box className={styles.table}>
        {MANDATE_ROWS.map((row) => (
          <Box key={row.id} className={styles.tableRow}>
            <Box className={styles.companyStrip}>
              <Box className={`${styles.companyLogo} ${row.logoClassName}`}>{row.logoText}</Box>
              <Typography component="span" className={styles.companyName}>
                {row.company}
              </Typography>
            </Box>

            <Box className={styles.gridHeader}>
              <Typography component="span" className={styles.gridLabel}>JOB TITLE</Typography>
              <Typography component="span" className={styles.gridLabel}>INDUSTRY</Typography>
              <Typography component="span" className={styles.gridLabel}>LOCATION</Typography>
              <Box className={styles.timelineHeader}>
                <Typography component="span" className={styles.gridLabel}>TIMELINE</Typography>
                <Box component="span" className={styles.timelineIcon} aria-hidden="true">⌃⌄</Box>
              </Box>
              <Typography component="span" className={styles.gridLabel}>STATUS</Typography>
            </Box>

            <Box className={styles.gridBody}>
              <Typography component="span" className={styles.gridValue}>{row.title}</Typography>
              <Typography component="span" className={styles.gridValue}>{row.industry}</Typography>
              <Typography component="span" className={styles.gridValue}>{row.location}</Typography>
              <Typography component="span" className={styles.gridValue}>{row.timeline}</Typography>
              <Box className={styles.statusCell}>
                <Box className={`${styles.statusPill} ${row.status === 'Draft' ? styles.statusDraft : styles.statusPosted}`}>
                  {row.status}
                </Box>
              </Box>
              <ButtonBase className={styles.moreButton} disableRipple aria-label={`More actions for ${row.title}`}>
                <Box component="span" className={styles.moreDot} />
                <Box component="span" className={styles.moreDot} />
                <Box component="span" className={styles.moreDot} />
              </ButtonBase>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
)
