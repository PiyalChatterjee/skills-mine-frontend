import { ROUTE_PATHS } from '@/routes/routePaths'
import type { Role } from '@/types/auth'

export type HeaderNavKey =
  | 'exploreJobs'
  | 'dashboard'
  | 'skillsBuild'
  | 'signIn'
  | 'candidateDashboard'
  | 'candidateJobApplications'
  | 'candidateSavedJobPosts'
  | 'candidateCvBuilder'
  | 'candidateSkillsBuild'
  | 'candidateBlog'

export type HeaderNavActionId =
  | 'jobApplications'
  | 'savedJobPosts'
  | 'cvBuilder'
  | 'skillsBuild'
  | 'blog'

type HeaderNavDefinition = {
  label: string
  to?: string
  requiresAuth?: boolean
  actionId?: HeaderNavActionId
}

export type HeaderNavItem = {
  id: HeaderNavKey
  label: string
  to?: string
  isActive: boolean
  requiresAuth?: boolean
  onClick?: () => void
}

export type HeaderNavActionMap = Partial<Record<HeaderNavActionId, () => void>>

const HEADER_NAV_DEFINITIONS: Record<HeaderNavKey, HeaderNavDefinition> = {
  exploreJobs: {
    label: 'Explore Jobs',
    to: ROUTE_PATHS.jobs,
    requiresAuth: true,
  },
  dashboard: {
    label: 'Dashboard',
    to: ROUTE_PATHS.portal,
    requiresAuth: true,
  },
  skillsBuild: {
    label: 'Skills Build',
    to: ROUTE_PATHS.landing,
  },
  signIn: {
    label: 'Sign in',
    to: ROUTE_PATHS.login,
  },
  candidateDashboard: {
    label: 'Dashboard',
    to: ROUTE_PATHS.candidateDashboard,
    requiresAuth: true,
  },
  candidateJobApplications: {
    label: 'Job Applications',
    actionId: 'jobApplications',
  },
  candidateSavedJobPosts: {
    label: 'Saved Job Posts',
    actionId: 'savedJobPosts',
  },
  candidateCvBuilder: {
    label: 'CV Builder',
    actionId: 'cvBuilder',
  },
  candidateSkillsBuild: {
    label: 'Skills Build',
    actionId: 'skillsBuild',
  },
  candidateBlog: {
    label: 'Blog',
    actionId: 'blog',
  },
}

export const PUBLIC_HEADER_NAV_PRESETS = {
  landing: ['signIn'] as const,
  discovery: ['exploreJobs', 'dashboard', 'skillsBuild', 'signIn'] as const,
} satisfies Record<string, readonly HeaderNavKey[]>

const ROLE_HEADER_NAV_PRESETS: Partial<Record<Role, readonly HeaderNavKey[]>> = {
  candidate: [
    'candidateDashboard',
    'candidateJobApplications',
    'candidateSavedJobPosts',
    'candidateCvBuilder',
    'candidateSkillsBuild',
    'candidateBlog',
  ],
}

export const getRoleHeaderNavKeys = (role?: Role): readonly HeaderNavKey[] => {
  if (!role) {
    return []
  }

  return ROLE_HEADER_NAV_PRESETS[role] ?? []
}

type BuildHeaderNavItemsOptions = {
  keys: readonly HeaderNavKey[]
  pathname: string
  actions?: HeaderNavActionMap
}

export const buildHeaderNavItems = ({
  keys,
  pathname,
  actions = {},
}: BuildHeaderNavItemsOptions): HeaderNavItem[] =>
  keys.map((key) => {
    const definition = HEADER_NAV_DEFINITIONS[key]

    return {
      id: key,
      label: definition.label,
      to: definition.to,
      isActive: Boolean(definition.to && definition.to === pathname),
      requiresAuth: definition.requiresAuth,
      onClick: definition.actionId ? actions[definition.actionId] : undefined,
    }
  })