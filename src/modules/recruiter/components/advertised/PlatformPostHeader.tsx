import styles from './PlatformPostHeader.module.css'

type PlatformPostHeaderProps = {
  /** Name shown in the status pill: "Posting to {platformName}" */
  platformName: string
  initials: string
  /** Logo tile + status accent colour */
  color: string
  /** Light tint of the accent, used for the status pill background */
  tint: string
  /** Darker shade of the accent, used for the status pill text */
  ink: string
  title: string
  locationTag?: string
  subtitle: string
  onBack: () => void
  onBackToJobs: () => void
}

const BackArrow = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M10 6H2M5.5 2.5L2 6l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ListIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M4.5 3h5.5M4.5 6h5.5M4.5 9h5.5M2 3h.01M2 6h.01M2 9h.01" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

export const PlatformPostHeader = ({
  platformName,
  initials,
  color,
  tint,
  ink,
  title,
  locationTag,
  subtitle,
  onBack,
  onBackToJobs,
}: PlatformPostHeaderProps) => (
  <>
    <div className={styles.topBar}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <button type="button" className={styles.backLink} onClick={onBack}>
          <BackArrow />
          Back
        </button>
        <span className={styles.crumbSep}>/</span>
        <span>New Job Post</span>
      </nav>
      <span className={styles.statusPill} style={{ background: tint, color: ink, borderColor: tint }}>
        <span className={styles.statusDot} style={{ background: color }} />
        Posting to {platformName}
      </span>
    </div>

    <section className={styles.platformCard}>
      <span className={styles.logo} style={{ background: color }} aria-hidden="true">
        {initials}
      </span>
      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {locationTag && <span className={styles.locationTag}>{locationTag}</span>}
        </div>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <button type="button" className={styles.backToJobs} onClick={onBackToJobs}>
        <ListIcon />
        Back to Jobs
      </button>
    </section>
  </>
)
