import { ROUTE_PATHS } from "@/routes/routePaths";
import type { Role } from "@/types/auth";

export type HeaderNavKey =
  | "exploreJobs"
  | "dashboard"
  | "skillsBuild"
  | "careerSupport"
  | "signIn"
  | "candidateDashboard"
  | "candidateSavedJobPosts"
  | "candidateCvBuilder"
  | "candidateSkillsBuild"
  | "candidateCareerSupport"
  | "recruiterDashboard"
  | "recruiterLatestOpenings"
  | "recruiterSavedJobPosts"
  | "recruiterCvBuilder"
  | "recruiterSkillsBuild"
  | "recruiterCareerSupport";

export type HeaderNavActionId =
  | "savedJobPosts"
  | "cvBuilder"
  | "skillsBuild"
  | "latestOpenings";

export type HeaderNavMenuLink = {
  label: string;
  href: string;
};

type HeaderNavDefinition = {
  label: string;
  to?: string;
  href?: string;
  menuItems?: readonly HeaderNavMenuLink[];
  requiresAuth?: boolean;
  actionId?: HeaderNavActionId;
};

export type HeaderNavItem = {
  id: HeaderNavKey;
  label: string;
  to?: string;
  href?: string;
  menuItems?: readonly HeaderNavMenuLink[];
  isActive: boolean;
  requiresAuth?: boolean;
  onClick?: () => void;
};

export type HeaderNavActionMap = Partial<Record<HeaderNavActionId, () => void>>;

const CAREER_SUPPORT_LINKS: readonly HeaderNavMenuLink[] = [
  {
    label: "Career Direction Self-Assessment",
    href: "https://theskillsmine.com/career-direction-self-assessment/",
  },
  {
    label: "CV Checklist and Sample CV",
    href: "https://theskillsmine.com/resource-1-cv-checklist-and-sample-cv/",
  },
  {
    label: "Job Opportunity Websites Guide",
    href: "https://theskillsmine.com/resource-2-learner-opportunity-websites-guide/",
  },
  {
    label: "LinkedIn Profile Checklist and Sample Profile",
    href: "https://theskillsmine.com/resource-3-linkedin-profile-checklist-and-sample-profile/",
  },
];

const HEADER_NAV_DEFINITIONS: Record<HeaderNavKey, HeaderNavDefinition> = {
  exploreJobs: {
    label: "Explore Jobs",
    to: ROUTE_PATHS.jobs,
    requiresAuth: true,
  },
  dashboard: {
    label: "Dashboard",
    to: ROUTE_PATHS.candidateDashboard,
    requiresAuth: true,
  },
  skillsBuild: {
    label: "Skills Build",
    href: "https://skillsbuild.org/",
  },
  careerSupport: {
    label: "Career Support",
    menuItems: CAREER_SUPPORT_LINKS,
  },
  signIn: {
    label: "Sign in",
    to: ROUTE_PATHS.login,
  },
  candidateDashboard: {
    label: "Dashboard",
    to: ROUTE_PATHS.candidateDashboard,
    requiresAuth: true,
  },
  candidateSavedJobPosts: {
    label: "Saved Job Posts",
    to: ROUTE_PATHS.savedJobs,
    requiresAuth: true,
  },
  candidateCvBuilder: {
    label: "CV Builder",
    to: ROUTE_PATHS.cvBuilder,
    requiresAuth: true,
  },
  candidateSkillsBuild: {
    label: "Skills Build",
    actionId: "skillsBuild",
  },
  candidateCareerSupport: {
    label: "Career Support",
    menuItems: CAREER_SUPPORT_LINKS,
  },
  recruiterDashboard: {
    label: "Dashboard",
    to: ROUTE_PATHS.recruiterDashboard,
    requiresAuth: true,
  },
  recruiterLatestOpenings: {
    label: "Latest Openings",
    actionId: "latestOpenings",
  },
  recruiterSavedJobPosts: {
    label: "Saved Job Posts",
    actionId: "savedJobPosts",
  },
  recruiterCvBuilder: {
    label: "CV Builder",
    actionId: "cvBuilder",
  },
  recruiterSkillsBuild: {
    label: "Skills Build",
    actionId: "skillsBuild",
  },
  recruiterCareerSupport: {
    label: "Career Support",
    menuItems: CAREER_SUPPORT_LINKS,
  },
};

export const PUBLIC_HEADER_NAV_PRESETS = {
  landing: ["skillsBuild", "careerSupport", "signIn"] as const,
  discovery: ["skillsBuild", "careerSupport", "signIn"] as const,
} satisfies Record<string, readonly HeaderNavKey[]>;

const ROLE_HEADER_NAV_PRESETS: Partial<Record<Role, readonly HeaderNavKey[]>> =
  {
    JOB_SEEKER: [
      "candidateDashboard",
      "candidateSavedJobPosts",
      "candidateCvBuilder",
      "candidateSkillsBuild",
      "candidateCareerSupport",
    ],
    RECRUITER: [
      "recruiterDashboard",
      "recruiterLatestOpenings",
      "recruiterSavedJobPosts",
      "recruiterCvBuilder",
      "recruiterSkillsBuild",
      "recruiterCareerSupport",
    ],
  };

export const getRoleHeaderNavKeys = (role?: Role): readonly HeaderNavKey[] => {
  if (!role) {
    return [];
  }

  return ROLE_HEADER_NAV_PRESETS[role] ?? [];
};

type BuildHeaderNavItemsOptions = {
  keys: readonly HeaderNavKey[];
  pathname: string;
  actions?: HeaderNavActionMap;
};

export const buildHeaderNavItems = ({
  keys,
  pathname,
  actions = {},
}: BuildHeaderNavItemsOptions): HeaderNavItem[] =>
  keys.map((key) => {
    const definition = HEADER_NAV_DEFINITIONS[key];

    return {
      id: key,
      label: definition.label,
      to: definition.to,
      href: definition.href,
      menuItems: definition.menuItems,
      isActive: Boolean(definition.to && definition.to === pathname),
      requiresAuth: definition.requiresAuth,
      onClick: definition.actionId ? actions[definition.actionId] : undefined,
    };
  });
