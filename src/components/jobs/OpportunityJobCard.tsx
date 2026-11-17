import { Button, Card, Chip, ClickAwayListener, IconButton, Popper, Typography } from "@mui/material";
import { useId, useState, type CSSProperties } from "react";
import { BookmarkIcon } from "@/components/icons/BookmarkIcon";
import styles from "./OpportunityJobCard.module.css";
import { jobMatchConfig } from "./jobMatch.config";

type OpportunityJobCardProps = {
  title: string;
  description: string;
  tags: string[];
  actionLabel: string;
  onAction: () => void;
  className?: string;
  matchScore?: number;
  showSaveButton?: boolean;
  isSaved?: boolean;
  isSaving?: boolean;
  onToggleSave?: () => void;
  saveLabel?: string;
  applicationStatus?: string;
  applicationStatusKey?: string;
};

const resolveMatchAppearance = (matchScore: number) => {
  if (matchScore >= jobMatchConfig.high.threshold) {
    return jobMatchConfig.high;
  }

  if (matchScore >= jobMatchConfig.medium.threshold) {
    return jobMatchConfig.medium;
  }

  return jobMatchConfig.low;
};

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
  applicationStatus,
  applicationStatusKey,
}: OpportunityJobCardProps) => {
  const [matchAnchor, setMatchAnchor] = useState<HTMLButtonElement | null>(null);
  const tooltipId = useId();
  // Match scores are display data; clamp malformed API values before calculating the ring angle.
  const clampedMatchScore =
    typeof matchScore === "number"
      ? Math.max(0, Math.min(100, Math.round(matchScore)))
      : undefined;

  const matchAppearance =
    typeof clampedMatchScore === "number"
      ? resolveMatchAppearance(clampedMatchScore)
      : jobMatchConfig.high;

  const ringStyle =
    typeof clampedMatchScore === "number"
      ? ({
          "--ring-fill": matchAppearance.color,
          "--ring-angle": `${clampedMatchScore * 3.6}deg`,
          "--ring-bg": matchAppearance.backgroundColor,
        } as CSSProperties)
      : undefined;

  return (
    <Card
      component="article"
      className={[styles.card, styles.short, className]
        .filter(Boolean)
        .join(" ")}
      elevation={0}
    >
      <div className={styles.top}>
        <div
          className={`${styles.header} ${typeof clampedMatchScore === "number" ? "" : styles.headerWithoutMatch}`}
        >
          {typeof clampedMatchScore === "number" ? (
            <ClickAwayListener onClickAway={() => setMatchAnchor(null)}>
              <div>
                <button
                  type="button"
                  className={styles.matchBadge}
                  style={ringStyle}
                  aria-label={`${clampedMatchScore}% match`}
                  aria-describedby={matchAnchor ? tooltipId : undefined}
                  aria-expanded={Boolean(matchAnchor)}
                  onClick={(event) => setMatchAnchor(matchAnchor ? null : event.currentTarget)}
                  onBlur={() => setMatchAnchor(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setMatchAnchor(null);
                  }}
                >
                  <Typography component="span" className={styles.matchBadgeLabel}>
                    {clampedMatchScore}%
                  </Typography>
                </button>
                <Popper
                  id={tooltipId}
                  role="tooltip"
                  open={Boolean(matchAnchor)}
                  anchorEl={matchAnchor}
                  placement="bottom-start"
                  modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
                  className={styles.matchTooltip}
                >
                  Based on your CV, this job is {matchAppearance.description} match for you.
                </Popper>
              </div>
            </ClickAwayListener>
          ) : null}

          <Typography component="h3" className={styles.title}>
            {title}
          </Typography>

          <div className={styles.applicationStatusContainer}>
            {applicationStatus ? (
              <Typography
                component="span"
                className={styles.applicationStatus}
                data-status={applicationStatusKey}
              >
                {applicationStatus}
              </Typography>
            ) : null}
          </div>

          {showSaveButton && onToggleSave ? (
            <div className={styles.saveButtonContainer}>
              <IconButton
                type="button"
                className={[
                  styles.saveButton,
                  isSaved ? styles.saveButtonActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={saveLabel}
                onClick={onToggleSave}
                disabled={isSaving}
              >
                <BookmarkIcon filled={isSaved} className={styles.saveIcon} />
              </IconButton>
            </div>
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

            <Typography
              component="p"
              className={styles.description}
            >
              {description}
            </Typography>
          </div>

          <Button variant="contained" className={styles.cta} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
};
