import { Box, ButtonBase, Typography } from '@mui/material'
import languagesIcon from '@/assets/cv-builder/languages-line.svg'
import styles from '../pages/CvBuilderPage.module.css'
import { CvBuilderFormPanel, CvBuilderSectionHeader } from './CvBuilderFormPrimitives'
import { LANGUAGES_LIST, type Language } from '../types/cvBuilder'

type CvBuilderLanguagesFormProps = {
  selectedLanguages: Set<Language>
  onToggleLanguage: (language: Language) => void
}

const CvBuilderLanguagesForm = ({
  selectedLanguages,
  onToggleLanguage,
}: CvBuilderLanguagesFormProps) => (
  <CvBuilderFormPanel>
    <CvBuilderSectionHeader iconSrc={languagesIcon} title="Languages" />

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
  </CvBuilderFormPanel>
)

export default CvBuilderLanguagesForm
