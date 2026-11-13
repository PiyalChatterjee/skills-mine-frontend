import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { extractErrorMessage } from "@/app/errorUtils";
import { usePageTitle } from "@/hooks/usePageTitle";
import { RecruiterSidebar } from "@/modules/recruiter/components/RecruiterSidebar";
import {
  formatPercentage,
  formatRevenue,
} from "@/modules/recruiter/utils/mancoFormatters";
import { useGetExcoDashboardQuery } from "@/store/api/apiSlice";
import barChartIcon from "@/assets/exco/bar-chart.svg";
import riskWarningIcon from "@/assets/exco/risk-warning.svg";
import aquaDot from "@/assets/exco/industry-aqua.svg";
import greenDot from "@/assets/exco/industry-green.svg";
import coralDot from "@/assets/exco/industry-coral.svg";
import yellowDot from "@/assets/exco/industry-yellow.svg";
import tealDot from "@/assets/exco/industry-teal.svg";
import styles from "./ExcoPage.module.css";

const industryDots = [aquaDot, greenDot, coralDot, yellowDot, tealDot];
const unavailable = "Not available";

const ExcoPage = () => {
  usePageTitle("EXCO Dashboard");
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetExcoDashboardQuery();
  const strategicMetrics = data
    ? [
        { label: "Placements YTD", value: data.strategicKpis.placementsYtd },
        {
          label: "Avg Contract Value",
          value:
            data.strategicKpis.avgContractValue == null
              ? unavailable
              : formatRevenue(data.strategicKpis.avgContractValue),
        },
        {
          label: "Revenue Earned (YTD)",
          value:
            data.strategicKpis.revenueEarnedYtd == null
              ? unavailable
              : formatRevenue(data.strategicKpis.revenueEarnedYtd),
        },
        {
          label: "Revenue Earned (MTD)",
          value:
            data.strategicKpis.revenueEarnedMtd == null
              ? unavailable
              : formatRevenue(data.strategicKpis.revenueEarnedMtd),
        },
      ]
    : [];
  const operationalMetrics = data
    ? [
        {
          label: "Active Clients",
          value: data.activeClientsCount,
          caption:
            data.avgPostedJobsPerActiveClientPerWeek == null
              ? null
              : `${data.avgPostedJobsPerActiveClientPerWeek} reqs/week avg`,
          unit: "",
        },
        {
          label: "Placement Velocity",
          value: data.placementVelocity,
          unit: "per week",
          caption: null,
        },
        {
          label: "Avg Time to Fill",
          value: data.avgTimeToFillDays,
          unit: "days",
          caption: null,
        },
        {
          label: "Offer Acceptance",
          value:
            data.offerAcceptanceRate == null
              ? null
              : formatPercentage(data.offerAcceptanceRate),
          unit: "",
          caption: null,
        },
      ]
    : [];

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar variant="exco" />
      <Box className={styles.pageRoot}>
        <Box component="header" className={styles.pageHeader}>
          <Typography component="h1" className={styles.pageTitle}>
            EXCO Dashboard
          </Typography>
          <Typography component="p" className={styles.pageSubtitle}>
            Executive overview - Placements, revenue, team performance, and
            market intelligence
          </Typography>
        </Box>
        {isLoading && (
          <Box role="status" className={styles.loading}>
            <CircularProgress size={28} />
            Loading executive overview...
          </Box>
        )}
        {isError && (
          <Alert
            severity="error"
            action={
              <Button onClick={() => void refetch()} disabled={isFetching}>
                Retry
              </Button>
            }
          >
            {extractErrorMessage(
              error,
              "Failed to load the executive overview.",
            )}
          </Alert>
        )}
        {data && (
          <Box className={styles.dashboard} aria-busy={isFetching}>
            <Box
              component="section"
              className={styles.card}
              aria-labelledby="exco-strategic-title"
            >
              <Typography
                component="h2"
                id="exco-strategic-title"
                className={styles.sectionTitle}
              >
                Strategic KPIs
              </Typography>
              <Box component="dl" className={styles.strategicMetrics}>
                {strategicMetrics.map((metric) => (
                  <Box key={metric.label} className={styles.strategicMetric}>
                    <dt>{metric.label}</dt>
                    <dd
                      className={
                        metric.value === unavailable
                          ? styles.unavailableValue
                          : undefined
                      }
                    >
                      {metric.value}
                    </dd>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box className={styles.insights}>
              <Box
                component="section"
                className={`${styles.card} ${styles.industriesCard}`}
                aria-labelledby="exco-industries-title"
              >
                <Typography
                  component="h2"
                  id="exco-industries-title"
                  className={styles.sectionTitle}
                >
                  <img src={barChartIcon} alt="" aria-hidden="true" />
                  Top Hiring Industries (YTD)
                </Typography>
                <Box component="dl" className={styles.industryList}>
                  {data.topHiringIndustries.map((industry, index) => (
                    <Box
                      key={industry.industryName}
                      className={styles.industry}
                    >
                      <dt>
                        <img
                          src={industryDots[index]}
                          alt=""
                          aria-hidden="true"
                        />
                        {industry.industryName}
                      </dt>
                      <dd>{industry.placementCount}</dd>
                    </Box>
                  ))}
                </Box>
                {data.topHiringIndustries.length === 0 && (
                  <Typography className={styles.emptyState}>
                    No hiring industry data for this snapshot.
                  </Typography>
                )}
              </Box>
              <Box
                component="section"
                className={styles.card}
                aria-labelledby="exco-risk-title"
              >
                <Typography
                  component="h2"
                  id="exco-risk-title"
                  className={styles.sectionTitle}
                >
                  <img src={riskWarningIcon} alt="" aria-hidden="true" />
                  Risk Indicators
                </Typography>
                <Box className={styles.riskPanel}>
                  <Typography component="h3" className={styles.sectionTitle}>
                    Client Churn
                  </Typography>
                  <Typography component="p" className={styles.riskValue}>
                    {data.riskIndicators.clientChurnRate == null
                      ? unavailable
                      : formatPercentage(data.riskIndicators.clientChurnRate)}
                  </Typography>
                  <Typography component="p" className={styles.caption}>
                    {data.riskIndicators.atRiskClientCount == null
                      ? "At-risk client count not available"
                      : `${data.riskIndicators.atRiskClientCount} at risk`}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              component="dl"
              className={styles.operationalMetrics}
              aria-label="Operational metrics"
            >
              {operationalMetrics.map((metric) => (
                <Box
                  key={metric.label}
                  className={`${styles.card} ${styles.operationalCard}`}
                >
                  <dt>{metric.label}</dt>
                  <dd
                    className={
                      metric.value == null
                        ? styles.unavailableValue
                        : styles.operationalValue
                    }
                  >
                    {metric.value ?? unavailable}
                  </dd>
                  {metric.value != null && metric.unit && (
                    <dd className={styles.caption}>{metric.unit}</dd>
                  )}
                  {metric.caption != null && (
                    <dd className={styles.caption}>{metric.caption}</dd>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExcoPage;
