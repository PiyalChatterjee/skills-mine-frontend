import { useMemo, useState } from "react";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import type { PublicLayoutOutletContext } from "@/layouts/PublicLayout";
import patternLeft from "@/assets/landing-page/pattern-two.svg";
import patternRight from "@/assets/landing-page/pattern-one.svg";
import paginationArrow from "@/assets/opportunities/figma-pagination-next.svg";
import { OpportunityJobCard, getJobTags } from "@/components/jobs";
import { OpportunitySearchControls } from "@/modules/candidate/components/OpportunitySearchControls";
import { datePostedOptions, jobTypeOptions } from "@/modules/candidate/hooks/useOpportunitySearchModalState";
import { useIndustryOptions } from "@/modules/candidate/hooks/useIndustryOptions";
import { useLocationOptions } from "@/modules/candidate/hooks/useLocationOptions";
import { useOptimisticSaveJob } from "@/modules/candidate/hooks/useOptimisticSaveJob";
import { PROFILE_SELECT_OPTIONS } from "@/modules/candidate/pages/profileForm.config";
import { getJobOperationId } from "@/modules/candidate/utils/jobIdentifier";
import { buildJobSearchParams, parseJobSearchParams, toJobsSearchFilters, type JobSearchQuery } from "@/modules/candidate/jobSearchParams";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { useListJobsPageQuery } from "@/store/api/apiSlice";
import type { Job } from "@/types";
import styles from "./JobSearchResultsPage.module.css";

const PAGE_SIZE = 5;
const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

const SearchHero = ({
  query,
  isSearching,
  industryOptions,
  locationOptions,
  onUpdate,
}: {
  query: JobSearchQuery;
  isSearching: boolean;
  industryOptions: readonly { value: string; label: string }[];
  locationOptions: readonly { value: string; label: string }[];
  onUpdate: (next: JobSearchQuery) => void;
}) => {
  const [searchValue, setSearchValue] = useState(query.search);

  return (
    <OpportunitySearchControls
      variant="hero"
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSearch={() => onUpdate({ ...query, search: searchValue.trim(), page: 1 })}
      isSearching={isSearching}
      industryOptions={industryOptions}
      locationOptions={locationOptions}
      datePostedOptions={datePostedOptions}
      jobTypeOptions={jobTypeOptions}
      selectedIndustries={query.industries}
      selectedLocations={query.locations}
      selectedDatePosted={query.datePosted ? [query.datePosted] : []}
      selectedJobTypes={query.jobType ? [query.jobType] : []}
      onIndustriesChange={(industries) => onUpdate({ ...query, industries, page: 1 })}
      onLocationsChange={(locations) => onUpdate({ ...query, locations, page: 1 })}
      onDatePostedChange={(values) => onUpdate({ ...query, datePosted: values[0], page: 1 })}
      onJobTypesChange={(values) => onUpdate({ ...query, jobType: values[0], page: 1 })}
    />
  );
};

const JobSearchResultsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const publicLayoutContext = useOutletContext<PublicLayoutOutletContext>();
  const { isJobSaved, isJobSaving, toggleJobSaved } = useOptimisticSaveJob();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseJobSearchParams(searchParams), [searchParams]);
  const industryOptions = toOptions(useIndustryOptions(PROFILE_SELECT_OPTIONS.targetedIndustries));
  const locationOptions = toOptions(useLocationOptions(PROFILE_SELECT_OPTIONS.preferredWorkType));
  const { data, isError, isFetching, isLoading } = useListJobsPageQuery({
    searchQuery: query.search || undefined,
    page: query.page,
    pageSize: PAGE_SIZE,
    filters: toJobsSearchFilters(query),
  });

  const total = data?.total ?? 0;
  const jobs = data?.jobs ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstResult = total === 0 ? 0 : (query.page - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(query.page * PAGE_SIZE, total);

  const updateQuery = (next: JobSearchQuery) => setSearchParams(buildJobSearchParams(next));
  const viewJob = (job: Job) => navigate(ROUTE_PATHS.jobDetails.replace(":jobId", job.jobId), {
    state: { job, from: `${ROUTE_PATHS.jobSearch}?${searchParams.toString()}` },
  });

  return (
    <Box className={styles.pageRoot}>
      <section className={styles.hero}>
        <img src={patternLeft} alt="" className={styles.patternLeft} />
        <img src={patternRight} alt="" className={styles.patternRight} />
        <Box className={styles.heroInner}>
          <SearchHero
            key={searchParams.toString()}
            query={query}
            isSearching={isFetching}
            industryOptions={industryOptions}
            locationOptions={locationOptions}
            onUpdate={updateQuery}
          />
        </Box>
      </section>

      <Box component="section" className={styles.results} aria-live="polite">
        {isLoading ? (
          <Box className={styles.loading}><CircularProgress size={32} /></Box>
        ) : isError ? (
          <Typography className={styles.feedback}>Unable to load opportunities. Please try again.</Typography>
        ) : jobs.length === 0 ? (
          <Typography className={styles.feedback}>No opportunities match your search.</Typography>
        ) : (
          <Box className={styles.cards}>
            {jobs.map((job) => {
              const operationId = getJobOperationId(job);
              const saved = isJobSaved(operationId);

              return (
                <OpportunityJobCard
                  key={job.jobId}
                  className={styles.resultCard}
                  title={job.title}
                  description={job.description ?? ""}
                  tags={getJobTags(job)}
                  actionLabel={isAuthenticated ? "View" : "Sign Up to View"}
                  onAction={() => {
                    if (isAuthenticated) {
                      viewJob(job);
                    } else {
                      publicLayoutContext.openSignUpDrawer();
                    }
                  }}
                  showSaveButton={isAuthenticated}
                  isSaved={saved}
                  isSaving={isJobSaving(operationId)}
                  onToggleSave={() => void toggleJobSaved(operationId)}
                  saveLabel={saved ? `Unsave ${job.title}` : `Save ${job.title}`}
                />
              );
            })}
          </Box>
        )}

        {!isLoading && !isError && total > 0 ? (
          <Box className={styles.paginationBar}>
            <Typography className={styles.resultCount}>
              Showing {firstResult} to {lastResult} of {total} results
            </Typography>
            <Box className={styles.pagination} aria-label="Results pagination">
              <IconButton
                aria-label="Previous page"
                className={styles.pageArrow}
                disabled={query.page <= 1}
                onClick={() => updateQuery({ ...query, page: query.page - 1 })}
              >
                <img src={paginationArrow} alt="" className={styles.previousIcon} />
              </IconButton>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={page === query.page ? styles.activePage : styles.pageNumber}
                  aria-current={page === query.page ? "page" : undefined}
                  onClick={() => updateQuery({ ...query, page })}
                >
                  {page}
                </button>
              ))}
              <IconButton
                aria-label="Next page"
                className={styles.pageArrow}
                disabled={query.page >= totalPages}
                onClick={() => updateQuery({ ...query, page: query.page + 1 })}
              >
                <img src={paginationArrow} alt="" />
              </IconButton>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default JobSearchResultsPage;