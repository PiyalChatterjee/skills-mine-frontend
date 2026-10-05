import type { JobsSearchFilters } from "@/services/api/jobsApi";

export type JobSearchQuery = {
  search: string;
  industries: string[];
  locations: string[];
  datePosted?: string;
  jobType?: string;
  page: number;
};

export const parseJobSearchParams = (params: URLSearchParams): JobSearchQuery => {
  const parsedPage = Number(params.get("page"));

  return {
    search: params.get("search")?.trim() ?? "",
    industries: params.getAll("industry").filter(Boolean),
    locations: params.getAll("location").filter(Boolean),
    datePosted: params.get("datePosted") || undefined,
    jobType: params.get("jobType") || undefined,
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
};

export const buildJobSearchParams = (query: JobSearchQuery) => {
  const params = new URLSearchParams();

  if (query.search) params.set("search", query.search);
  query.industries.forEach((industry) => params.append("industry", industry));
  query.locations.forEach((location) => params.append("location", location));
  if (query.datePosted) params.set("datePosted", query.datePosted);
  if (query.jobType) params.set("jobType", query.jobType);
  if (query.page > 1) params.set("page", String(query.page));

  return params;
};

export const toJobsSearchFilters = (query: JobSearchQuery): JobsSearchFilters => ({
  industries: query.industries,
  locations: query.locations,
  datePosted: query.datePosted,
  jobTypes: query.jobType ? [query.jobType] : [],
});