import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { PlatformCard } from '@/modules/recruiter/components/advertised/PlatformCard'
import { externalJobsApi, type ExternalJobProvider } from '@/services/api/externalJobsApi'
import { mandateApi } from '@/services/api/mandateApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './AdvertiseJobPage.module.css'

const AdvertiseJobPage = () => {
  usePageTitle('Advertise Job')
  const navigate = useNavigate()
  const { mandateId } = useParams<{ mandateId: string }>()
  const [jobTitle, setJobTitle] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [providers, setProviders] = useState<ExternalJobProvider[]>([])
  const [providersLoading, setProvidersLoading] = useState(true)
  const [providersError, setProvidersError] = useState(false)

  useEffect(() => {
    let cancelled = false
    externalJobsApi
      .getProviders()
      .then((data) => {
        if (!cancelled) setProviders(data)
      })
      .catch(() => {
        if (!cancelled) setProvidersError(true)
      })
      .finally(() => {
        if (!cancelled) setProvidersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!mandateId) return
    let cancelled = false
    mandateApi
      .getJobPostDetail(mandateId)
      .then((envelope) => {
        if (!cancelled) setJobTitle(envelope.data.title ?? '')
      })
      .catch(() => {
        // title is cosmetic; leave the subtitle blank on failure
      })
    return () => {
      cancelled = true
    }
  }, [mandateId])

  const handleContinue = () => {
    if (!mandateId) return
    if (selected === 'PNET') {
      navigate(ROUTE_PATHS.recruiterAdvertisePnet.replace(':mandateId', mandateId))
    } else if (selected === 'ADZUNA') {
      navigate(ROUTE_PATHS.recruiterAdvertiseAdzuna.replace(':mandateId', mandateId))
    } else if (selected === 'BIZCOMMUNITY') {
      navigate(ROUTE_PATHS.recruiterAdvertiseBizCommunity.replace(':mandateId', mandateId))
    }
  }

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />
      <Box className={styles.content}>
        <div className={styles.main}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Select Distribution Platform</h1>
              <p className={styles.subtitle}>Advertising: {jobTitle}</p>
            </div>
          </div>

          <div className={styles.grid} role="radiogroup" aria-label="Distribution platform">
            {providers.map((provider) => (
              <PlatformCard
                key={provider.provider_id}
                provider={provider}
                selected={selected === provider.provider_code}
                onSelect={setSelected}
              />
            ))}
          </div>
          {providersLoading && <p className={styles.subtitle}>Loading platforms…</p>}
          {providersError && (
            <p className={styles.subtitle} role="alert">
              Unable to load distribution platforms. Please try again later.
            </p>
          )}
          {!providersLoading && !providersError && providers.length === 0 && (
            <p className={styles.subtitle}>No distribution platforms are available.</p>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.count}>
            {selected ? 1 : 0} {selected ? 'platform' : 'platforms'} selected
          </span>
          <button
            type="button"
            className={styles.continueBtn}
            disabled={!selected}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </Box>
    </Box>
  )
}

export default AdvertiseJobPage
