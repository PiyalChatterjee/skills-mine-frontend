import { Button, Card, Chip, IconButton, Typography } from '@mui/material'
import type { CSSProperties } from 'react'
import { BookmarkIcon } from '@/components/icons/BookmarkIcon'
import styles from './OpportunityJobCard.module.css'

type OpportunityJobCardProps = {
  title: string
  description: string
  tags: string[]
  actionLabel: string
  onAction: () => void
  className?: string
  matchScore?: number
  showSaveButton?: boolean
  isSaved?: boolean
  isSaving?: boolean
  onToggleSave?: () => void
  saveLabel?: string
}

const resolveMatchColor = (matchScore: number) => {
  if (matchScore >= 80) {
    return '#4baf73'
  }

  if (matchScore >= 60) {
    return '#e6a83b'
  }

  return '#32abbf'
}

export const OpportunityJobCard = ({
  title,
  description,
  tags,
  actionLabel,
  onAction,
  className,
  matchScore,
  showSaveButton = false,
  isSaved = false,
  isSaving = false,
  onToggleSave,
  saveLabel,
}: OpportunityJobCardProps) => {
  const clampedMatchScore =
    typeof matchScore === 'number'
      ? Math.max(0, Math.min(100, Math.round(matchScore)))
      : undefined

  const ringColor =
    typeof clampedMatchScore === 'number'
      ? resolveMatchColor(clampedMatchScore)
      : '#4baf73'

  const ringBgColor = ringColor === '#e6a83b' ? '#faeed8' : '#dbefe3'

  const ringStyle =
    typeof clampedMatchScore === 'number'
      ? ({
          '--ring-fill': ringColor,
          '--ring-angle': `${clampedMatchScore * 3.6}deg`,
          '--ring-bg': ringBgColor,
        } as CSSProperties)
      : undefined

  return (
    <Card
      component="article"
      className={[styles.card, styles.short, className].filter(Boolean).join(' ')}
      elevation={0}
    >
      <div className={styles.top}>
        <div className={styles.header}>
          {typeof clampedMatchScore === 'number' ? (
            <div className={styles.matchBadge} style={ringStyle} aria-label={`${clampedMatchScore}% match`}>
              <Typography component="span" className={styles.matchBadgeLabel}>
                {clampedMatchScore}%
              </Typography>
            </div>
          ) : null}

          <Typography component="h3" className={styles.title} sx={{ m: 0 }}>
            {title}
          </Typography>

          {showSaveButton && onToggleSave ? (
            <IconButton
              type="button"
              className={[styles.saveButton, isSaved ? styles.saveButtonActive : ''].filter(Boolean).join(' ')}
              aria-label={saveLabel}
              onClick={onToggleSave}
              disabled={isSaving}
            >
              <BookmarkIcon filled={isSaved} className={styles.saveIcon} />
            </IconButton>
          ) : null}
        </div>

        <div className={styles.rule} />
      </div>

      <div className={styles.body}>
        <div className={styles.contentColumn}>
          <div className={styles.tagAndCopy}>
            <div className={styles.tagRow}>
              {tags.map((tag) => (
                <Chip
                  key={`${title}-${tag}`}
                  label={tag}
                  variant="outlined"
                  className={styles.tagChip}
                />
              ))}
            </div>

            <Typography component="p" className={styles.description} sx={{ m: 0 }}>
              {description}
            </Typography>
          </div>

          <Button
            variant="contained"
            className={styles.cta}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  )
}
