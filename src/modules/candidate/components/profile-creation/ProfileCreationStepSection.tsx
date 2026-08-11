import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import styles from '@/modules/candidate/pages/ProfileCreationPage.module.css'

type ProfileCreationStepSectionProps = {
  iconSrc: string
  title: string
  children: ReactNode
}

const ProfileCreationStepSection = ({
  iconSrc,
  title,
  children,
}: ProfileCreationStepSectionProps) => (
  <Box component="section" className={styles.sectionBlock}>
    <Box className={styles.sectionHeader}>
      <Box className={styles.sectionIconBadge} aria-hidden="true">
        <img src={iconSrc} alt="" className={styles.sectionIcon} />
      </Box>
      <Typography component="h2" className={styles.sectionTitle}>
        {title}
      </Typography>
    </Box>

    <Box className={styles.sectionBody}>{children}</Box>
  </Box>
)

export default ProfileCreationStepSection