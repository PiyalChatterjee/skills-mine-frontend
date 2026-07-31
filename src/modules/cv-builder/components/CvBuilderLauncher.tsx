import { Box, ButtonBase, Typography } from '@mui/material'
import styles from '../pages/CvBuilderPage.module.css'
import type { CvActionCard } from '../types/cvBuilder'

type CvBuilderLauncherProps = {
  cards: CvActionCard[]
}

const CvBuilderLauncher = ({ cards }: CvBuilderLauncherProps) => (
  <>
    <Typography component="h2" className={styles.welcomeHeading}>
      Welcome to The Skills Mine CV Builder.
    </Typography>

    <Box className={styles.cardsGrid}>
      {cards.map((card) => (
        <Box key={card.id} className={styles.cardColumn}>
          <ButtonBase
            type="button"
            onClick={card.onClick}
            disableRipple
            className={`${styles.cardButton} ${styles[`cardButton${card.tone[0].toUpperCase()}${card.tone.slice(1)}`]}`}
          >
            <Box
              className={`${styles.iconFrame} ${styles[`iconFrame${card.tone[0].toUpperCase()}${card.tone.slice(1)}`]}`}
              aria-hidden="true"
            >
              <Box component="img" src={card.icon} alt="" className={styles.icon} />
            </Box>
            <Typography component="p" className={styles.cardTitle}>
              {card.title}
            </Typography>
          </ButtonBase>

          <Typography component="p" className={styles.cardDescription}>
            {card.description}
          </Typography>
        </Box>
      ))}
    </Box>
  </>
)

export default CvBuilderLauncher
