import { CrmClassificationLabel } from "@/enums/statuses";
import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Pagination, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useSearchQueryState } from '@/hooks/useSearchQueryState'
import { extractErrorMessage } from '@/app/errorUtils'
import { useGetCrmClientsQuery } from '@/store/api/apiSlice'
import { UpdateCrmClientDialog } from '@/modules/crm/components/CrmClientDialogs'
import { CrmCard, MagnifierIcon, StatTile } from '@/modules/crm/components/CrmPresentation'
import type { CrmClient } from '@/types/api'
import styles from './RecruiterCrmPage.module.css'

const RecruiterCrmPage = ({ navigation = 'recruiter' }: { navigation?: 'recruiter' | 'exco' }) => {
  usePageTitle('CRM')
  const search = useSearchQueryState({ minCharacters: 1 })
  const [pagination, setPagination] = useState({ key: '', page: 1 })
  const [selectedClient, setSelectedClient] = useState<CrmClient | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const filterKey = search.debouncedValue
  const page = pagination.key === filterKey ? pagination.page : 1
  const { currentData: data, isFetching, isError, error, refetch } = useGetCrmClientsQuery({
    page, size: 20,
    ...(search.debouncedValue ? { search: search.debouncedValue } : {}),
  })

  return (
    <Box className={`${styles.shell} ${navigation === 'exco' ? styles.excoShell : ''}`}>
      <RecruiterSidebar variant={navigation} />

      <Box className={styles.pageRoot}>
        <Box className={styles.pageHeader}>
          <Typography component="h1" className={styles.pageTitle}>CRM Dashboard</Typography>
        </Box>
        {successMessage && <Alert severity="success" onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}
        {isError && (
          <Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>
            {extractErrorMessage(error, 'Failed to load CRM clients.')}
          </Alert>
        )}

        {/* Stat tiles */}
        <Box className={styles.statTilesPanel}>
          <StatTile value={data?.summary.needsAttention} label={CrmClassificationLabel.NEEDS_ATTENTION} colorClass={styles.statTileRed}   leadType={CrmClassificationLabel.NEEDS_ATTENTION} />
          <StatTile value={data?.summary.hotLeads}       label="Hot Leads"       colorClass={styles.statTileGreen} leadType={CrmClassificationLabel.HOT_LEAD} />
          <StatTile value={data?.summary.warmContacts}   label="Warm Contacts"   colorClass={styles.statTileAmber} leadType={CrmClassificationLabel.WARM_CONTACT} />
          <StatTile value={data?.summary.coldLeads}      label="Cold Leads"      colorClass={styles.statTileTeal}  leadType={CrmClassificationLabel.COLD_LEAD} />
        </Box>

        {/* Search */}
        <Box className={styles.filters}>
          <Box className={styles.searchWrap}>
          <Box className={styles.searchIcon}><MagnifierIcon /></Box>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search"
            aria-label="Search contacts"
            value={search.inputValue}
            onChange={search.handleInputChange}
          />
          </Box>
        </Box>

        {/* Cards */}
        <Box className={styles.cardsList} aria-busy={isFetching}>
          {isFetching && <CircularProgress aria-label="Loading CRM clients" />}
          {!isFetching && !isError && data?.clients.length === 0 && (
            <Typography>No CRM clients found.</Typography>
          )}
          {data?.clients.map((contact) => (
            <CrmCard key={contact.clientId} contact={contact} onUpdate={(client) => {
              setSuccessMessage('')
              setSelectedClient(client)
            }} />
          ))}
        </Box>
        {data && data.totalPages > 1 && (
          <Pagination className={styles.pagination} count={data.totalPages} page={page}
            disabled={isFetching} onChange={(_event, nextPage) => setPagination({ key: filterKey, page: nextPage })} />
        )}
      </Box>
      {selectedClient && <UpdateCrmClientDialog key={selectedClient.clientId} client={selectedClient}
        onClose={() => setSelectedClient(null)} onSaved={() => {
          setSelectedClient(null)
          setSuccessMessage('Client updated successfully.')
        }} />}
    </Box>
  )
}

export default RecruiterCrmPage
