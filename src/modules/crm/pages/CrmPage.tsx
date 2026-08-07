import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { crmApi } from '@/services/api/crmApi'
import type { CrmClient } from '@/types/api'

const CrmPage = () => {
  const [clients, setClients] = useState<CrmClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingClientId, setIsSubmittingClientId] = useState<string | null>(null)
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadClients = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const response = await crmApi.listClients({ page: 1, limit: 25 })
      setClients(response.data.clients)
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message ?? 'Failed to load CRM clients.')
          : 'Failed to load CRM clients.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadClients()
  }, [])

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => a.company.localeCompare(b.company)),
    [clients],
  )

  const submitNote = async (clientId: string) => {
    const note = (noteDrafts[clientId] ?? '').trim()
    if (!note) {
      return
    }

    try {
      setIsSubmittingClientId(clientId)
      await crmApi.addClientNote(clientId, { note })
      setNoteDrafts((previous) => ({
        ...previous,
        [clientId]: '',
      }))
      await loadClients()
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message ?? 'Failed to add note.')
          : 'Failed to add note.'
      setErrorMessage(message)
    } finally {
      setIsSubmittingClientId(null)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1080, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
        CRM
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Client relationships and activity notes.
      </Typography>

      {errorMessage ? <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert> : null}

      {sortedClients.length === 0 ? (
        <Typography color="text.secondary">No CRM clients found.</Typography>
      ) : (
        <Stack spacing={2}>
          {sortedClients.map((client) => (
            <Box
              key={client.clientId}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="h6">{client.company}</Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                Status: {client.status.replaceAll('_', ' ')}
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="Add note"
                value={noteDrafts[client.clientId] ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  setNoteDrafts((previous) => ({
                    ...previous,
                    [client.clientId]: value,
                  }))
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                <Typography color="text.secondary" variant="body2">
                  Notes: {client.notes?.length ?? 0}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  disabled={isSubmittingClientId === client.clientId || !(noteDrafts[client.clientId] ?? '').trim()}
                  onClick={() => {
                    void submitNote(client.clientId)
                  }}
                >
                  {isSubmittingClientId === client.clientId ? 'Saving...' : 'Add note'}
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}

export default CrmPage
