import { Box, ButtonBase, TextField, Typography } from '@mui/material'
import type { ChangeEvent } from 'react'
import languagesIcon from '@/assets/cv-builder/languages-line.svg'
import styles from '../pages/CvBuilderPage.module.css'
import { CvBuilderFormPanel, CvBuilderSectionHeader } from './CvBuilderFormPrimitives'
import { LANGUAGES_LIST, type Language } from '../types/cvBuilder'

type CvBuilderLanguagesFormProps = {
  selectedLanguages: Set<Language>
  formError?: string
  otherLanguageError?: string
  otherLanguageValue: string
  onToggleLanguage: (language: Language) => void
  onOtherLanguageChange: (value: string) => void
}

const CvBuilderLanguagesForm = ({
  selectedLanguages,
  formError,
  otherLanguageError,
  otherLanguageValue,
  onToggleLanguage,
  onOtherLanguageChange,
}: CvBuilderLanguagesFormProps) => (
  <CvBuilderFormPanel>
    <CvBuilderSectionHeader iconSrc={languagesIcon} title="Languages" />

    {formError ? (
      <Typography component="p" sx={{ color: '#d32f2f', marginBottom: 2 }}>
        {formError}
      </Typography>
    ) : null}

    <Box className={styles.languagesGrid}>
      {LANGUAGES_LIST.map((language) => {
        const isSelected = selectedLanguages.has(language)
        return (
          <ButtonBase
            key={language}
            type="button"
            onClick={() => onToggleLanguage(language)}
            className={`${styles.languageCheckItem} ${isSelected ? styles.languageCheckItemSelected : ''}`}
            disableRipple
          >
            <Box
              className={`${styles.languageCheckbox} ${isSelected ? styles.languageCheckboxChecked : ''}`}
              aria-hidden="true"
            >
              {isSelected && (
                <Box component="span" className={styles.languageCheckmark}>✓</Box>
              )}
            </Box>
            <Typography component="span" className={styles.languageCheckLabel}>
              {language}
            </Typography>
          </ButtonBase>
        )
      })}
    </Box>

    {selectedLanguages.has('Other') ? (
      <Box sx={{ marginTop: 2 }}>
        <Typography component="label" className={styles.fieldLabel}>
          Other language
        </Typography>
        <TextField
          value={otherLanguageValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onOtherLanguageChange(event.target.value)}
          error={Boolean(otherLanguageError)}
          helperText={otherLanguageError}
          placeholder="Enter language"
          className={styles.fieldControl}
          variant="outlined"
          fullWidth
        />
      </Box>
    ) : null}
  </CvBuilderFormPanel>
)

export default CvBuilderLanguagesForm
