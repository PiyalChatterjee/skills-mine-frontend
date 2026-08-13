import { Button, Card, Chip, IconButton, Typography } from '@mui/material'
import type { CSSProperties } from 'react'
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

const BookmarkIcon = ({ filled }: { filled: boolean }) => {
  if (filled) {
    return (
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true" className={styles.saveIcon}>
        <path d="M0.75 0H11.25C11.6642 0 12 0.347013 12 0.775066V15.6124C12 15.8264 11.8321 16 11.625 16C11.5546 16 11.4855 15.9794 11.4258 15.9407L6 12.4253L0.574193 15.9407C0.398723 16.0544 0.167295 15.9996 0.0572773 15.8182C0.0198523 15.7566 0 15.6852 0 15.6124V0.775066C0 0.347013 0.33579 0 0.75 0Z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true" className={styles.saveIcon}>
      <path d="M0.75 0H11.25C11.6642 0 12 0.347013 12 0.775066V15.6124C12 15.8264 11.8321 16 11.625 16C11.5546 16 11.4855 15.9794 11.4258 15.9407L6 12.4253L0.574193 15.9407C0.398723 16.0544 0.167295 15.9996 0.0572773 15.8182C0.0198523 15.7566 0 15.6852 0 15.6124V0.775066C0 0.347013 0.33579 0 0.75 0ZM10.5 1.55013H1.5V13.5113L6 10.5957L10.5 13.5113V1.55013Z" fill="currentColor" />
    </svg>
  )
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
              <BookmarkIcon filled={isSaved} />
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
