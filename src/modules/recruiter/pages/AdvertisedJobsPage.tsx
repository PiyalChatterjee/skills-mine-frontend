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
  type HarambeePublishRecord,
  type PnetPublishPayload,
  type PnetPublishRecord,
} from '@/services/api/externalJobsApi'
import { adzunaApi, type AdzunaJobJsonRecord } from '@/services/api/adzunaApi'
import { mapAdzunaRecordToAdvertisedJob } from './adzunaJobsMapper'
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

const parsePayloadJson = (payloadJson: unknown): PnetPublishPayload | undefined => {
  if (!payloadJson) return undefined
  if (typeof payloadJson === 'object') return payloadJson as PnetPublishPayload
  if (typeof payloadJson === 'string') {
    try {
      return JSON.parse(payloadJson) as PnetPublishPayload
    } catch {
      return undefined
    }
  }
  return undefined
}

const mapPnetRecordToAdvertisedJob = (
  record: PnetPublishRecord,
  pnetDetailsLookup?: Map<string, PnetPublishPayload>,
): AdvertisedJob => {
  const directPayload = parsePayloadJson(record.payload_json)
  const fallbackPayload =
    (record.job_profile_id_ref ? pnetDetailsLookup?.get(record.job_profile_id_ref) : undefined) ||
    (record.reference_id ? pnetDetailsLookup?.get(record.reference_id) : undefined) ||
    (record.listingid ? pnetDetailsLookup?.get(String(record.listingid)) : undefined)

  const payload = directPayload?.jobdetails?.jobtitle ? directPayload : (fallbackPayload || directPayload)
  const jobdetails = payload?.jobdetails || record.jobdetails
  const categorization = payload?.categorization || record.categorization

  const contractType =
    record.contract_type ||
    categorization?.contracttype?.[0] ||
    record.work_type ||
    'Permanent'

  const salaryObj = jobdetails?.salary
  let salary = 'Market Related'
  const minVal = salaryObj?.minimum ?? record.salary_minimum
  const maxVal = salaryObj?.maximum ?? record.salary_maximum
  const currency = salaryObj?.currency ?? record.salary_currency ?? 'ZAR'
  const period = salaryObj?.period ?? record.salary_period ?? 'pm'
  const currSymbol = currency === 'ZAR' || currency === 'R' ? 'R' : `${currency} `
  const periodLabel =
    period.toLowerCase() === 'yearly' || period.toLowerCase() === 'annual'
      ? 'pa'
      : period.toLowerCase() === 'monthly'
        ? 'pm'
        : period

  if (minVal || maxVal) {
    const min = minVal ? `${currSymbol}${minVal.toLocaleString()}` : `${currSymbol}0`
    const max = maxVal ? `${currSymbol}${maxVal.toLocaleString()}` : ''
    salary = max ? `${min} - ${max} ${periodLabel}` : `${min} ${periodLabel}`
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

  const isDelete =
    record.operation?.toUpperCase() === 'DELETE' ||
    directPayload?.action?.toUpperCase() === 'OFFLINE'

  let status = 'Live'
  if (isDelete) {
    status = record.status === 'SUCCESS' ? 'Deleted' : (record.status || 'Deleted')
  } else if (record.status === 'SUCCESS') {
    status = 'Live'
  } else if (record.status) {
    status = record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase()
  }

  const listingId = record.listingid ?? record.listing_id
  const reference = listingId
    ? `PN-${listingId}`
    : record.reference_number || record.reference_id || '—'

  const title =
    jobdetails?.jobtitle ||
    record.job_title ||
    record.jobtitle ||
    (listingId ? `PNet Job (${reference})` : 'Untitled Job')

  const location =
    jobdetails?.joblocations?.[0]?.city ||
    record.city_name ||
    record.city ||
    '—'

  const jobUrl = jobdetails?.apply?.url || record.job_url || record.url

  return {
    id: record.publish_id,
    title,
    reference,
    employmentType: contractType,
    platform: 'pNet',
    location,
    salary,
    posted,
    status,
    jobUrl,
    jobProfileIdRef: record.job_profile_id_ref,
    errorDetail: record.error_detail ?? undefined,
    providerMessage: record.provider_message ?? undefined,
  }
}

const mapHarambeeRecordToAdvertisedJob = (record: HarambeePublishRecord): AdvertisedJob => {
  let posted = '—'
  if (record.created_at) {
    const d = new Date(record.created_at)
    if (!isNaN(d.getTime())) {
      posted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } else {
      posted = record.created_at
    }
  }

  // Rows only exist for successful operations; the last operation decides the state
  // (PUBLISH / EDIT = live on SA Youth, DELETE = removed).
  const status = record.operation?.toUpperCase() === 'DELETE' ? 'Deleted' : 'Live'

  return {
    id: record.publish_id,
    title: record.job_title || 'Untitled Job',
    reference: record.reference_number || record.harambee_opportunity_id || record.job_profile_id_ref || '—',
    employmentType: record.contract_type || '—',
    platform: 'Harambee',
    location: record.address?.city_name || '—',
    salary: record.salary || 'Market Related',
    posted,
    status,
    jobUrl: record.job_url,
    harambeeOpportunityId: record.harambee_opportunity_id ? String(record.harambee_opportunity_id) : undefined,
    jobProfileIdRef: record.job_profile_id_ref,
    errorDetail: record.error_detail ?? undefined,
    providerMessage: record.provider_message ?? undefined,
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
  const [pnetPublishes, setPnetPublishes] = useState<PnetPublishRecord[]>([])
  const [harambeePublishes, setHarambeePublishes] = useState<HarambeePublishRecord[]>([])
  const [adzunaPublishes, setAdzunaPublishes] = useState<AdzunaJobJsonRecord[]>([])

  const fetchJobsData = useCallback(async () => {
    const [bizPublishesRes, listedJobsRes, pnetPublishesRes, harambeePublishesRes, adzunaPublishesRes] =
      await Promise.allSettled([
        externalJobsApi.getBizCommunityPublishes(),
        externalJobsApi.getBizCommunityJobs(),
        externalJobsApi.getPnetPublishes(),
        externalJobsApi.getHarambeePublishes(),
        adzunaApi.getAdzunaJobsAsJson(),
      ])

    if (bizPublishesRes.status === 'fulfilled' && Array.isArray(bizPublishesRes.value)) {
      setBizPublishes(bizPublishesRes.value)
    }
    if (listedJobsRes.status === 'fulfilled' && Array.isArray(listedJobsRes.value)) {
      setBizListedJobs(listedJobsRes.value)
    }
    if (pnetPublishesRes.status === 'fulfilled' && Array.isArray(pnetPublishesRes.value)) {
      setPnetPublishes(pnetPublishesRes.value)
    }
    if (harambeePublishesRes.status === 'fulfilled' && Array.isArray(harambeePublishesRes.value)) {
      setHarambeePublishes(harambeePublishesRes.value)
    }
    if (adzunaPublishesRes.status === 'fulfilled' && Array.isArray(adzunaPublishesRes.value)) {
      setAdzunaPublishes(adzunaPublishesRes.value)
    } else if (adzunaPublishesRes.status === 'rejected') {
      dispatch(pushNotification({
        level: 'error',
        title: 'Unable to load Adzuna adverts',
        message: extractErrorMessage(adzunaPublishesRes.reason, 'Could not load Adzuna published jobs.'),
      }))
    }
  }, [dispatch])

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

    // Build lookup for PNet records containing jobdetails to enrich DELETE/OFFLINE records
    const pnetDetailsLookup = new Map<string, PnetPublishPayload>()
    for (const record of pnetPublishes) {
      const payload = parsePayloadJson(record.payload_json)
      if (payload?.jobdetails?.jobtitle) {
        if (record.job_profile_id_ref) pnetDetailsLookup.set(record.job_profile_id_ref, payload)
        if (record.reference_id) pnetDetailsLookup.set(record.reference_id, payload)
        if (record.listingid) pnetDetailsLookup.set(String(record.listingid), payload)
      }
    }

    const bizJobs = bizPublishes.map((record) => ({
      job: mapBizRecordToAdvertisedJob(record, listedLookup),
      createdAt: record.created_at ? new Date(record.created_at).getTime() : 0,
    }))
    const pnetJobs = pnetPublishes.map((record) => ({
      job: mapPnetRecordToAdvertisedJob(record, pnetDetailsLookup),
      createdAt: record.created_at ? new Date(record.created_at).getTime() : 0,
    }))
    const adzunaJobs = adzunaPublishes.map((record) => ({
      job: mapAdzunaRecordToAdvertisedJob(record),
      createdAt: record.created_at ? new Date(record.created_at).getTime() : 0,
    }))

    const harambeeJobs = harambeePublishes.map((record) => ({
      job: mapHarambeeRecordToAdvertisedJob(record),
      createdAt: record.created_at ? new Date(record.created_at).getTime() : 0,
    }))

    const combined = [...bizJobs, ...pnetJobs, ...harambeeJobs, ...adzunaJobs]
    combined.sort((a, b) => b.createdAt - a.createdAt)
    return combined.map((item) => item.job)
  }, [adzunaPublishes, bizPublishes, bizListedJobs, pnetPublishes, harambeePublishes])

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
    } else if (job.jobProfileIdRef && job.platform === 'pNet') {
      const url = `${ROUTE_PATHS.recruiterAdvertisePnet.replace(':mandateId', job.jobProfileIdRef)}?isEdit=true`
      navigate(url, {
        state: {
          isEdit: true,
          referenceId: job.jobProfileIdRef,
        },
      })
    } else if (job.jobProfileIdRef && job.platform === 'Harambee') {
      const url = `${ROUTE_PATHS.recruiterAdvertiseHarambee.replace(':mandateId', job.jobProfileIdRef)}?isEdit=true&publishId=${encodeURIComponent(job.id)}`
      navigate(url, {
        state: {
          isEdit: true,
          publishId: job.id,
          referenceId: job.jobProfileIdRef,
        },
      })
    } else if (job.platform === 'Adzuna') {
      if (!job.jobProfileIdRef || !job.adzunaJobId) {
        dispatch(pushNotification({
          level: 'error',
          title: 'Edit unavailable',
          message: 'The Adzuna job profile reference is missing for this advert.',
        }))
        return
      }

      const url = `${ROUTE_PATHS.recruiterAdvertiseAdzuna.replace(':mandateId', job.jobProfileIdRef)}?adzunaJobId=${encodeURIComponent(job.adzunaJobId)}`
      navigate(url, {
        state: { adzunaJobId: job.adzunaJobId },
      })
    }
  }

  const handleDelete = async (job: AdvertisedJob, reason?: string) => {
    if (job.platform === 'bizCommunity') {
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
    } else if (job.platform === 'pNet') {
      const referenceId = job.jobProfileIdRef
      if (!referenceId) {
        dispatch(
          pushNotification({
            level: 'error',
            title: 'Delete failed',
            message: 'Reference ID is missing for this PNet advert.',
          }),
        )
        return
      }

      try {
        await externalJobsApi.deletePnetJob(referenceId)
        dispatch(
          pushNotification({
            level: 'success',
            title: 'Advert Deleted',
            message: `Job advert "${job.title}" has been deleted from PNet.`,
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
              'Failed to delete the job advert from PNet. Please try again.',
            ),
          }),
        )
      }
    } else if (job.platform === 'Harambee') {
      if (!job.harambeeOpportunityId) {
        dispatch(
          pushNotification({
            level: 'error',
            title: 'Delete failed',
            message: 'Harambee opportunity ID is missing for this advert.',
          }),
        )
        return
      }

      try {
        await externalJobsApi.deleteHarambeeJob(job.harambeeOpportunityId, reason ?? '')
        dispatch(
          pushNotification({
            level: 'success',
            title: 'Advert Deleted',
            message: `Job advert "${job.title}" has been deleted from Harambee.`,
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
              'Failed to delete the job advert from Harambee. Please try again.',
            ),
          }),
        )
      }
    } else if (job.platform === 'Adzuna') {
      if (!job.adzunaJobId) {
        dispatch(pushNotification({
          level: 'error',
          title: 'Delete failed',
          message: 'The Adzuna job ID is missing for this advert.',
        }))
        return
      }

      try {
        await adzunaApi.deleteAdzunaJob(job.adzunaJobId)
        dispatch(pushNotification({
          level: 'success',
          title: 'Advert Deactivated',
          message: `Job advert "${job.title}" has been deactivated on Adzuna.`,
        }))
        await fetchJobsData()
      } catch (error) {
        dispatch(pushNotification({
          level: 'error',
          title: 'Delete failed',
          message: extractErrorMessage(error, 'Could not deactivate the job on Adzuna. Please try again.'),
        }))
      }
    } else {
      dispatch(
        pushNotification({
          level: 'info',
          title: 'Delete not supported',
          message: `Deleting job adverts directly from ${job.platform} is not currently supported.`,
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
