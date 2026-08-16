import { Box, IconButton, InputAdornment, TextField } from '@mui/material'
import type { ChangeEvent } from 'react'
import searchClearIconUrl from '@/assets/landing-page/search-clear-icon.svg'
import searchIconUrl from '@/assets/landing-page/search-icon.svg'
import styles from './OpportunitiesSearchInput.module.css'

type OpportunitiesSearchInputProps = {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  placeholder?: string
  ariaLabel?: string
  className?: string
}

export const OpportunitiesSearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search',
  ariaLabel = 'Search opportunities',
  className,
}: OpportunitiesSearchInputProps) => {
  return (
    <Box className={[styles.searchWrap, className].filter(Boolean).join(' ')}>
      <TextField
        className={styles.searchInput}
        placeholder={placeholder}
        aria-label={ariaLabel}
        variant="outlined"
        fullWidth
        value={value}
        onChange={onChange}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {value.length > 0 ? (
                  <IconButton
                    type="button"
                    aria-label="Clear search"
                    onClick={onClear}
                    className={styles.searchIconButton}
                  >
                    <img src={searchClearIconUrl} alt="" aria-hidden="true" />
                  </IconButton>
                ) : (
                  <Box className={styles.searchIconShell} aria-hidden="true">
                    <img src={searchIconUrl} alt="" aria-hidden="true" />
                  </Box>
                )}
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  )
}
