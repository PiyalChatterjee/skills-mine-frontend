import { ROUTE_PATHS } from "@/routes/routePaths";
import type { Role } from "@/types/auth";

export type HeaderNavKey =
  | "exploreJobs"
  | "dashboard"
  | "skillsBuild"
  | "signIn"
  | "candidateDashboard"
  | "candidateSavedJobPosts"
  | "candidateCvBuilder"
  | "candidateSkillsBuild"
  | "candidateBlog"
  | "recruiterDashboard"
  | "recruiterLatestOpenings"
  | "recruiterSavedJobPosts"
  | "recruiterCvBuilder"
  | "recruiterSkillsBuild"
  | "recruiterBlog";

export type HeaderNavActionId =
  | "savedJobPosts"
  | "cvBuilder"
  | "skillsBuild"
  | "blog"
  | "latestOpenings";

type HeaderNavDefinition = {
  label: string;
  to?: string;
  requiresAuth?: boolean;
  actionId?: HeaderNavActionId;
};

export type HeaderNavItem = {
  id: HeaderNavKey;
  label: string;
  to?: string;
  isActive: boolean;
  requiresAuth?: boolean;
  onClick?: () => void;
};

export type HeaderNavActionMap = Partial<Record<HeaderNavActionId, () => void>>;

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
    to: ROUTE_PATHS.landing,
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
  candidateBlog: {
    label: "Blog",
    actionId: "blog",
  },
  recruiterDashboard: {
    label: "Dashboard",
    to: ROUTE_PATHS.recruiter,
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
  recruiterBlog: {
    label: "Blog",
    actionId: "blog",
  },
};

export const PUBLIC_HEADER_NAV_PRESETS = {
  landing: ["signIn"] as const,
  discovery: ["exploreJobs", "dashboard", "skillsBuild", "signIn"] as const,
} satisfies Record<string, readonly HeaderNavKey[]>;

const ROLE_HEADER_NAV_PRESETS: Partial<Record<Role, readonly HeaderNavKey[]>> =
  {
    JOB_SEEKER: [
      "candidateDashboard",
      "candidateSavedJobPosts",
      "candidateCvBuilder",
      "candidateSkillsBuild",
      "candidateBlog",
    ],
    RECRUITER: [
      "recruiterDashboard",
      "recruiterLatestOpenings",
      "recruiterSavedJobPosts",
      "recruiterCvBuilder",
      "recruiterSkillsBuild",
      "recruiterBlog",
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
      isActive: Boolean(definition.to && definition.to === pathname),
      requiresAuth: definition.requiresAuth,
      onClick: definition.actionId ? actions[definition.actionId] : undefined,
    };
  });
