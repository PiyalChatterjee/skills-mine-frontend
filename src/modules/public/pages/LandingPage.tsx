import { Button } from "@mui/material";
import aiIconUrl from "@/assets/landing-page/ai-icon.svg";
import bookmarkIconUrl from "@/assets/landing-page/bookmark-icon.svg";
import chartIconUrl from "@/assets/landing-page/chart-icon.svg";
import employerOrbFourUrl from "@/assets/landing-page/employer-orb-four.svg";
import employerOrbOneUrl from "@/assets/landing-page/employer-orb-one.svg";
import employerOrbThreeUrl from "@/assets/landing-page/employer-orb-three.svg";
import employerOrbTwoUrl from "@/assets/landing-page/employer-orb-two.svg";
import patternOneUrl from "@/assets/landing-page/pattern-one.svg";
import patternThreeUrl from "@/assets/landing-page/pattern-three.svg";
import patternTwoUrl from "@/assets/landing-page/pattern-two.svg";
import searchIconUrl from "@/assets/landing-page/search-icon.svg";
import shieldIconUrl from "@/assets/landing-page/shield-icon.svg";
import starIconUrl from "@/assets/landing-page/star-icon.svg";
import timeIconUrl from "@/assets/landing-page/time-icon.svg";
import styles from "./LandingPage.module.css";

type Opportunity = {
  id: string;
  title: string;
  tags: string[];
  description: string;
  employerName: string;
  employerOrbSrc: string;
  blurredEmployer?: boolean;
  tallCard?: boolean;
};

type Feature = {
  id: string;
  label: string;
  iconSrc: string;
};

type Metric = {
  id: string;
  value: string;
  label: string;
  cardClassName: string;
};

const opportunities: Opportunity[] = [
  {
    id: "1",
    title: "Senior Logistics Manager",
    tags: ["Manufacturing", "Johannesburg"],
    description:
      "We’re looking for an experienced Senior Logistics Manager to lead and optimise our end-to-end supply chain operations. In this role, you’ll oversee production scheduling, inventory planning, warehousing, and national distribution to ensure our glass products reach customers efficiently and on time.",
    employerName: "PG Glass",
    employerOrbSrc: employerOrbOneUrl,
    blurredEmployer: true,
    tallCard: true,
  },
  {
    id: "2",
    title: "Compliance Analyst",
    tags: ["Legal", "Johannesburg", "Full time"],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim mi a odio elementum, maximus luctus tortor iaculis. Ut auctor euismod leo egestas elementum. Vestibulum dignissim tincidunt tincidunt.",
    employerName: "Webber Wentzel",
    employerOrbSrc: employerOrbTwoUrl,
    blurredEmployer: true,
    tallCard: true,
  },
  {
    id: "3",
    title: "Cyber Compliance Specialist",
    tags: ["Legal", "Financial Services", "Johannesburg"],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim mi a odio elementum, maximus luctus tortor iaculis. Ut auctor euismod leo egestas elementum. Vestibulum dignissim tincidunt tincidunt.",
    employerName: "TymeBank",
    employerOrbSrc: employerOrbThreeUrl,
    blurredEmployer: true,
  },
  {
    id: "4",
    title: "12-month Digital Marketing Learnership",
    tags: ["Digital Marketing", "Cape Town", "Learnership"],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim mi a odio elementum, maximus luctus tortor iaculis. Ut auctor euismod leo egestas elementum. Vestibulum dignissim tincidunt tincidunt.",
    employerName: "Helm",
    employerOrbSrc: employerOrbFourUrl,
    blurredEmployer: true,
  },
  {
    id: "5",
    title: "Business Development Consultant",
    tags: ["Legal", "Cape Town"],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim mi a odio elementum, maximus luctus tortor iaculis. Ut auctor euismod leo egestas elementum. Vestibulum dignissim tincidunt tincidunt.",
    employerName: "Webber Wentzel",
    employerOrbSrc: employerOrbTwoUrl,
  },
  {
    id: "6",
    title: "Business Development Consultant",
    tags: ["Legal", "Cape Town"],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dignissim mi a odio elementum, maximus luctus tortor iaculis. Ut auctor euismod leo egestas elementum. Vestibulum dignissim tincidunt tincidunt.",
    employerName: "Webber Wentzel",
    employerOrbSrc: employerOrbTwoUrl,
  },
];

const features: Feature[] = [
  { id: "1", label: "ATS-Optimised CVs", iconSrc: shieldIconUrl },
  { id: "2", label: "Suitability Scores", iconSrc: chartIconUrl },
  { id: "3", label: "5 Minute Signup", iconSrc: timeIconUrl },
  { id: "4", label: "Personalised Recommendations", iconSrc: starIconUrl },
];

const metrics: Metric[] = [
  { id: "1", value: "2500+", label: "Active Roles", cardClassName: styles.metricCardWideLeft },
  { id: "2", value: "85%", label: "Match Rate", cardClassName: styles.metricCardNarrow },
  { id: "3", value: "14 Days", label: "Average Time to Hire", cardClassName: styles.metricCardWideRight },
];

const LandingPage = () => {
  return (
    <div className={styles.pageRoot}>
      <section className={styles.heroSection}>
        <img src={patternOneUrl} alt="" className={styles.heroPatternOne} aria-hidden="true" />
        <img src={patternTwoUrl} alt="" className={styles.heroPatternTwo} aria-hidden="true" />
        <img src={patternThreeUrl} alt="" className={styles.heroPatternThree} aria-hidden="true" />

        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <img src={aiIconUrl} alt="" className={styles.heroBadgeIcon} aria-hidden="true" />
            <span>AI-Powered Matching</span>
          </div>

          <div className={styles.heroSwitch}>
            <button type="button" className={styles.heroSwitchActive}>
              Find a job
            </button>
            <button type="button" className={styles.heroSwitchIdle}>
              Start hiring
            </button>
          </div>

          <div className={styles.heroTextBlock}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleStrong}>Your perfect role,</span>{" "}
              <span className={styles.heroTitleLight}>matched to you.</span>
            </h1>

            <div className={styles.heroCopy}>
              <p className={styles.heroText}>Upload your CV once.</p>
              <p className={styles.heroText}>Get matched with bespoke opportunities.</p>
              <p className={styles.heroText}>
                Our AI optimises your profile and connects you with roles where you&apos;ll thrive.
              </p>
            </div>
          </div>

          <Button variant="contained" className={styles.heroCta}>
            Sign up and Browse Jobs
          </Button>

          <div className={styles.metricsGrid}>
            {metrics.map((metric) => (
              <div key={metric.id} className={metric.cardClassName}>
                <p className={styles.metricValue}>{metric.value}</p>
                <p className={styles.metricLabel}>{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featureBar}>
        <div className={styles.featureBarInner}>
          {features.map((feature) => (
            <div key={feature.id} className={styles.featureItem}>
              <img src={feature.iconSrc} alt="" className={styles.featureIcon} aria-hidden="true" />
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.opportunitiesSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeadingGroup}>
            <h2 className={styles.sectionTitle}>Latest Opportunities</h2>
            <p className={styles.sectionSubtitle}>
              Sign up to reveal employer details and apply
            </p>
          </div>
          <div className={styles.searchWrap}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search"
              aria-label="Search opportunities"
            />
            <span className={styles.searchIcon} aria-hidden="true">
              <img src={searchIconUrl} alt="" className={styles.searchIconImage} />
            </span>
          </div>
        </div>

        <div className={styles.cardGrid}>
          {opportunities.map((job) => (
            <article
              key={job.id}
              className={`${styles.jobCard} ${job.tallCard ? styles.jobCardTall : styles.jobCardShort}`}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{job.title}</h3>
                  <button type="button" className={styles.bookmarkButton} aria-label={`Save ${job.title}`}>
                    <img src={bookmarkIconUrl} alt="" className={styles.bookmarkIcon} aria-hidden="true" />
                  </button>
                </div>
                <div className={styles.cardRule} />
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardContentColumn}>
                  <div className={styles.tagAndCopy}>
                    <div className={styles.tagRow}>
                      {job.tags.map((tag) => (
                        <span key={tag} className={styles.tagChip}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className={styles.cardDescription}>{job.description}</p>
                  </div>

                  <Button variant="contained" className={styles.cardCta}>
                    Sign Up to View
                  </Button>
                </div>

                <div className={styles.companyThumb} aria-hidden="true">
                  <img src={job.employerOrbSrc} alt="" className={styles.companyOrbImage} />
                  <span
                    className={`${styles.companyName} ${job.blurredEmployer ? styles.companyNameBlurred : ""}`}
                  >
                    {job.employerName}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
