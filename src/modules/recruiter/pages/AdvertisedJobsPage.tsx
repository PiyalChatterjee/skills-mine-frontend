import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Box, ButtonBase } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { extractErrorMessage } from '@/app/errorUtils'
import { pushNotification } from '@/store/slices/notificationSlice'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { AdvertisedJobsTable } from '@/modules/recruiter/components/advertised/AdvertisedJobsTable'
import {
  ADVERTISED_PLATFORMS,
  type AdvertisedJob,
  type AdvertisedPlatform,
} from '@/modules/recruiter/data/advertisedJobsData'
import {
  externalJobsApi,
  type BizCommunityListedJob,
  type BizCommunityPublishRecord,
} from '@/services/api/externalJobsApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './AdvertisedJobsPage.module.css'

type PlatformFilter = 'All' | AdvertisedPlatform

const FINAL_STATUSES = ['live', 'deleted', 'suspended', 'expired']
const STATUS_POLL_INTERVAL_MS = 60_000

const BackArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="6.6" />
    <path d="M5.2 8.2l2 2 3.6-4" />
  </svg>
)

type ListedJobsLookup = {
  byId: Map<string, BizCommunityListedJob>
  byRef: Map<string, BizCommunityListedJob>
}

const mapBizRecordToAdvertisedJob = (
  record: BizCommunityPublishRecord,
  listedLookup: ListedJobsLookup,
): AdvertisedJob => {
  let employmentType = 'Permanent'
  if (record.is_contract) {
    employmentType = record.contract_period ? `Contract (${record.contract_period})` : 'Contract'
  } else if (record.is_temporary) {
    employmentType = 'Temporary'
  } else if (record.is_permanent) {
    employmentType = 'Permanent'
  }

  let salary = 'Market Related'
  if (record.remuneration_description) {
    salary = record.remuneration_description
  } else if (record.remuneration_minimum || record.remuneration_maximum) {
    const min = record.remuneration_minimum ? `R${record.remuneration_minimum.toLocaleString()}` : 'R0'
    const max = record.remuneration_maximum ? `R${record.remuneration_maximum.toLocaleString()}` : ''
    salary = max ? `${min} - ${max} pm` : `${min} pm`
  }

  let posted = '—'
  if (record.created_at) {
    try {
      const d = new Date(record.created_at)
      if (!isNaN(d.getTime())) {
        posted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    } catch {
      posted = record.created_at
    }
  }

  // Lookup matching live job from BizCommunity listed jobs
  const matchedJob =
    (record.biz_job_id ? listedLookup.byId.get(String(record.biz_job_id)) : undefined) ||
    (record.reference_number ? listedLookup.byRef.get(record.reference_number) : undefined)

  // Use live status from BizCommunity if available, otherwise fallback to publish record status
  const status = matchedJob?.status || (record.status === 'SUCCESS' ? 'Live' : (record.status || 'Live'))
  const jobUrl = matchedJob?.url || record.job_url

  return {
    id: record.publish_id,
    title: record.job_title || matchedJob?.job_title || 'Untitled Job',
    reference: record.reference_number || matchedJob?.reference_number || (record.biz_job_id ? `BC-${record.biz_job_id}` : '—'),
    employmentType,
    platform: 'bizCommunity',
    location: record.city_name || '—',
    salary,
    posted,
    status,
    jobUrl,
    bizJobId: record.biz_job_id ?? (matchedJob ? String(matchedJob.job_id) : undefined),
    jobProfileIdRef: record.job_profile_id_ref,
    errorDetail: record.error_detail,
    providerMessage: record.provider_message,
  }
}

const AdvertisedJobsPage = () => {
  usePageTitle('Advertised Jobs')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const locationState = location.state as { platformName?: string; bannerMessage?: string } | null
  const bannerText =
    locationState?.bannerMessage ||
    (locationState?.platformName
      ? `Job successfully posted to ${locationState.platformName}.`
      : null)

  const [filter, setFilter] = useState<PlatformFilter>('All')
  const [bizPublishes, setBizPublishes] = useState<BizCommunityPublishRecord[]>([])
  const [bizListedJobs, setBizListedJobs] = useState<BizCommunityListedJob[]>([])

  const fetchJobsData = useCallback(async () => {
    try {
      const [publishesRes, listedJobsRes] = await Promise.allSettled([
        externalJobsApi.getBizCommunityPublishes(),
        externalJobsApi.getBizCommunityJobs(),
      ])

      if (publishesRes.status === 'fulfilled' && Array.isArray(publishesRes.value)) {
        setBizPublishes(publishesRes.value)
      }
      if (listedJobsRes.status === 'fulfilled' && Array.isArray(listedJobsRes.value)) {
        setBizListedJobs(listedJobsRes.value)
      }
    } catch {
      // keep fallback
    }
  }, [])

  const fetchListedJobs = useCallback(async () => {
    try {
      const listedJobs = await externalJobsApi.getBizCommunityJobs()
      if (Array.isArray(listedJobs)) {
        setBizListedJobs(listedJobs)
      }
    } catch {
      // keep previous statuses
    }
  }, [])

  // Guard against React StrictMode's double-invoke in development
  const initialFetchDoneRef = useRef(false)

  useEffect(() => {
    if (initialFetchDoneRef.current) return
    initialFetchDoneRef.current = true
    fetchJobsData()
  }, [fetchJobsData])

  const allJobs = useMemo(() => {
    const byId = new Map<string, BizCommunityListedJob>()
    const byRef = new Map<string, BizCommunityListedJob>()

    for (const job of bizListedJobs) {
      if (job.job_id != null) {
        byId.set(String(job.job_id), job)
      }
      if (job.reference_number) {
        byRef.set(job.reference_number, job)
      }
    }

    const listedLookup: ListedJobsLookup = { byId, byRef }
    return bizPublishes.map((record) => mapBizRecordToAdvertisedJob(record, listedLookup))
  }, [bizPublishes, bizListedJobs])

  const hasNonFinalStatus = useMemo(
    () => allJobs.some((job) => !FINAL_STATUSES.includes(String(job.status).trim().toLowerCase())),
    [allJobs],
  )

  useEffect(() => {
    if (!hasNonFinalStatus) return undefined
    const intervalId = window.setInterval(fetchListedJobs, STATUS_POLL_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [hasNonFinalStatus, fetchListedJobs])

  const countFor = (platform: AdvertisedPlatform) =>
    allJobs.filter((job) => job.platform === platform).length

  const visibleJobs = useMemo(
    () => (filter === 'All' ? allJobs : allJobs.filter((job) => job.platform === filter)),
    [filter, allJobs],
  )

  const filters: { key: PlatformFilter; label: string; count: number }[] = [
    { key: 'All', label: 'All', count: allJobs.length },
    ...ADVERTISED_PLATFORMS.map((platform) => ({
      key: platform,
      label: platform,
      count: countFor(platform),
    })),
  ]

  const handleEdit = (job: AdvertisedJob) => {
    if (job.jobProfileIdRef && job.platform === 'bizCommunity') {
      const url = `${ROUTE_PATHS.recruiterAdvertiseBizCommunity.replace(':mandateId', job.jobProfileIdRef)}${
        job.bizJobId ? `?bizJobId=${job.bizJobId}` : ''
      }`
      navigate(url, {
        state: {
          bizJobId: job.bizJobId,
          isEdit: true,
        },
      })
    }
  }

  const handleDelete = async (job: AdvertisedJob) => {
    if (!job.bizJobId) {
      dispatch(
        pushNotification({
          level: 'error',
          title: 'Delete failed',
          message: 'BizCommunity Job ID is missing for this advert.',
        }),
      )
      return
    }

    try {
      await externalJobsApi.deleteBizCommunityJob(job.bizJobId)
      dispatch(
        pushNotification({
          level: 'success',
          title: 'Advert Deleted',
          message: `Job advert "${job.title}" has been deleted from Bizcommunity.`,
        }),
      )
      await fetchJobsData()
    } catch (error) {
      dispatch(
        pushNotification({
          level: 'error',
          title: 'Delete Failed',
          message: extractErrorMessage(
            error,
            'Failed to delete the job advert from Bizcommunity. Please try again.',
          ),
        }),
      )
    }
  }

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />
      <Box className={styles.content}>
        <div className={styles.header}>
          <ButtonBase
            className={styles.backBtn}
            onClick={() => navigate(ROUTE_PATHS.recruiterJobPosts)}
            disableRipple
          >
            <BackArrowIcon /> Back
          </ButtonBase>
          <div>
            <h1 className={styles.title}>Advertised Jobs</h1>
            <p className={styles.subtitle}>Every job advert posted to external platforms</p>
          </div>
        </div>

        {bannerText && (
          <div className={styles.banner} role="status">
            <CheckCircleIcon />
            {bannerText}
          </div>
        )}

        <div className={styles.filtersRow}>
          <div className={styles.pills}>
            {filters.map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                className={`${styles.pill} ${filter === key ? styles.pillActive : ''}`}
                onClick={() => setFilter(key)}
              >
                {label} ({count})
              </button>
            ))}
          </div>

        </div>

        <AdvertisedJobsTable
          jobs={visibleJobs}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>
    </Box>
  )
}

export default AdvertisedJobsPage
