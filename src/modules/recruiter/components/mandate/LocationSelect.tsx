import { useEffect, useMemo, useState } from 'react'
import type { Control, UseFormSetValue } from 'react-hook-form'
import { Controller, useFormState, useWatch } from 'react-hook-form'
import { ListSubheader, MenuItem, Select } from '@mui/material'
import { locationApi, type MasterLocation } from '@/services/api/locationApi'
import type { MandateFormValues } from './types'
import styles from './form.module.css'

interface Props {
  control: Control<MandateFormValues>
  setValue: UseFormSetValue<MandateFormValues>
}

type LocationGroup = { label: string; options: MasterLocation[] }

const COUNTRY_GROUP = 'Other African Countries'

/** Group master locations: provinces first, then other African countries. */
const groupLocations = (locations: MasterLocation[]): LocationGroup[] => {
  const groups = new Map<string, MasterLocation[]>()
  for (const location of locations) {
    const label =
      location.type === 'COUNTRY'
        ? COUNTRY_GROUP
        : location.province || location.country || 'Other'
    const bucket = groups.get(label)
    if (bucket) bucket.push(location)
    else groups.set(label, [location])
  }
  const rank = (label: string) => (label === COUNTRY_GROUP ? 1 : 0)
  return [...groups.entries()]
    .map(([label, options]) => ({ label, options }))
    .sort((a, b) => rank(a.label) - rank(b.label))
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

export const LocationSelect = ({ control, setValue }: Props) => {
  const { errors } = useFormState({ control })
  const [locations, setLocations] = useState<MasterLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const locationName = useWatch({ control, name: 'location' })
  const locationId = useWatch({ control, name: 'locationId' })

  useEffect(() => {
    locationApi
      .getMasterLocations()
      .then((items) => setLocations(items.filter((item) => item.type !== 'WORK_OPTION')))
      .catch(() => {
        // silently degrade — the select will simply have no options
      })
      .finally(() => setIsLoading(false))
  }, [])

  // Edit flow: the saved post only carries a location name, so resolve its master id once options load.
  useEffect(() => {
    if (locationId || !locationName || locations.length === 0) return
    const match = locations.find(
      (item) => sameName(item.name, locationName) || sameName(item.name, locationName.split(',')[0]),
    )
    if (match) setValue('locationId', match.locationId, { shouldDirty: false })
  }, [locations, locationId, locationName, setValue])

  const groups = useMemo(() => groupLocations(locations), [locations])
  const hasError = Boolean(errors.location)

  return (
    <div className={styles.field}>
      <label className={styles.label} id="location-select-label">Location *</label>
      <Controller
        name="locationId"
        control={control}
        render={({ field }) => (
          <Select
            value={locations.some((item) => item.locationId === field.value) ? field.value : ''}
            onChange={(event) => {
              const selected = locations.find((item) => item.locationId === event.target.value)
              field.onChange(selected?.locationId ?? '')
              setValue('location', selected?.name ?? '', { shouldValidate: true, shouldDirty: true })
            }}
            onBlur={field.onBlur}
            displayEmpty
            error={hasError}
            disabled={isLoading}
            inputProps={{ 'aria-labelledby': 'location-select-label' }}
            renderValue={(value) => {
              const selected = locations.find((item) => item.locationId === value)
              return selected ? selected.name : <span style={{ color: '#9ca3af' }}>Select</span>
            }}
            MenuProps={{ slotProps: { paper: { sx: { maxHeight: 320 } } } }}
            sx={{
              borderRadius: '8px',
              fontFamily: "'Red Hat Text', 'Inclusive Sans', 'Ubuntu', sans-serif",
              fontSize: 16,
              color: '#2A3132',
              backgroundColor: '#ffffff',
              '& .MuiSelect-select': { padding: '10px 14px' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: hasError ? '#dc2626' : '#d1d5db' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: hasError ? '#dc2626' : '#2B96D9',
                borderWidth: 1,
              },
            }}
          >
            {groups.flatMap((group) => [
              <ListSubheader key={`group-${group.label}`} sx={{ fontWeight: 700, color: '#1f2328' }}>
                {group.label}
              </ListSubheader>,
              ...group.options.map((option) => (
                <MenuItem key={option.locationId} value={option.locationId} sx={{ pl: 4 }}>
                  {option.name}
                </MenuItem>
              )),
            ])}
          </Select>
        )}
      />
      {errors.location && <p className={styles.errorText}>{errors.location.message}</p>}
    </div>
  )
}
