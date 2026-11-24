import { useState } from 'react'
import {
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Popover,
} from '@mui/material'
import {
  PLATFORM_META,
  type AdvertisedJob,
} from '@/modules/recruiter/data/advertisedJobsData'
import styles from './AdvertisedJobsTable.module.css'

type AdvertisedJobsTableProps = {
  jobs: AdvertisedJob[]
  onEdit?: (job: AdvertisedJob) => void
  onDelete?: (job: AdvertisedJob, reason?: string) => void
}

const COLUMNS = ['Job title', 'Platform', 'Location', 'Salary', 'Posted', 'Status']

const KebabIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
    <circle cx="7" cy="2.75" r="1.1" />
    <circle cx="7" cy="7" r="1.1" />
    <circle cx="7" cy="11.25" r="1.1" />
  </svg>
)

const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 13.5l.7-3L11 2.7a1.4 1.4 0 0 1 2 2L5.5 12.8l-3 .7z" />
    <path d="M9.8 3.9l2.3 2.3" />
  </svg>
)

const DeleteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 4h11" />
    <path d="M6 4V2.5h4V4" />
    <path d="M3.8 4l.7 9.5h7l.7-9.5" />
    <path d="M6.6 6.8v4M9.4 6.8v4" />
  </svg>
)

const getStatusClassName = (status: string) => {
  const s = String(status).trim().toLowerCase()
  if (s === 'live') return styles.statusLive
  if (s === 'failed' || s === 'error') return styles.statusFailed
  return styles.statusSuspended
}

export const AdvertisedJobsTable = ({ jobs, onEdit, onDelete }: AdvertisedJobsTableProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [activeJob, setActiveJob] = useState<AdvertisedJob | null>(null)
  const [pendingDeleteJob, setPendingDeleteJob] = useState<AdvertisedJob | null>(null)
  const [deleteReason, setDeleteReason] = useState('')
  // Harambee requires a reason for deleting an opportunity (forwarded to SA Youth).
  const needsReason = pendingDeleteJob?.platform === 'Harambee'

  const closeMenu = () => {
    setAnchorEl(null)
    setActiveJob(null)
  }

  const handleAction = (action?: (job: AdvertisedJob) => void) => {
    if (activeJob) action?.(activeJob)
    closeMenu()
  }

  const handleDeleteClick = () => {
    if (activeJob) {
      setDeleteReason('')
      setPendingDeleteJob(activeJob)
    }
    closeMenu()
  }

  const handleConfirmDelete = () => {
    if (pendingDeleteJob) {
      onDelete?.(pendingDeleteJob, needsReason ? deleteReason.trim() : undefined)
    }
    setPendingDeleteJob(null)
  }

  return (
    <div className={styles.card}>
      <div className={`${styles.row} ${styles.headerRow}`}>
        {COLUMNS.map((label) => (
          <div key={label} className={styles.headerCell}>
            {label}
          </div>
        ))}
        <div />
      </div>

      {jobs.map((job) => {
        const platform = PLATFORM_META[job.platform]
        return (
          <div key={job.id} className={`${styles.row} ${styles.bodyRow}`}>
            <div className={`${styles.cell} ${styles.titleCell}`}>
              <span className={styles.jobTitle}>{job.title}</span>
              <span className={styles.jobRef}>
                Ref {job.reference} · {job.employmentType}
              </span>
            </div>
            <div className={styles.cell}>
              <span className={styles.platform}>
                <span className={styles.platformBadge} style={{ background: platform.color }}>
                  {platform.initials}
                </span>
                {job.platform}
              </span>
            </div>
            <div className={`${styles.cell} ${styles.locationCell}`}>{job.location}</div>
            <div className={`${styles.cell} ${styles.salaryCell}`}>{job.salary}</div>
            <div className={`${styles.cell} ${styles.postedCell}`}>{job.posted}</div>
            <div className={styles.cell}>
              <span className={`${styles.status} ${getStatusClassName(job.status)}`}>
                <span className={styles.statusDot} />
                {job.status}
              </span>
            </div>
            <div className={styles.kebabCell}>
              <button
                type="button"
                className={styles.kebabBtn}
                aria-label={`Actions for ${job.title}`}
                onClick={(event) => {
                  setAnchorEl(event.currentTarget)
                  setActiveJob(job)
                }}
              >
                <KebabIcon />
              </button>
            </div>
          </div>
        )
      })}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { className: styles.menu } }}
      >
        <button type="button" className={styles.menuItem} onClick={() => handleAction(onEdit)}>
          <EditIcon />
          Edit
        </button>
        <div className={styles.menuDivider} />
        <button
          type="button"
          className={`${styles.menuItem} ${styles.menuItemDanger}`}
          onClick={handleDeleteClick}
        >
          <DeleteIcon />
          Delete
        </button>
      </Popover>

      <Dialog
        open={Boolean(pendingDeleteJob)}
        onClose={() => setPendingDeleteJob(null)}
        slotProps={{ paper: { className: styles.confirmDialog } }}
        aria-labelledby="confirm-delete-advert-title"
        aria-describedby="confirm-delete-advert-desc"
      >
        <DialogTitle id="confirm-delete-advert-title" className={styles.confirmDialogTitle}>
          Delete advertised job?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-advert-desc" className={styles.confirmDialogBody}>
            Are you sure you want to delete the job advertisement for{' '}
            <strong>"{pendingDeleteJob?.title}"</strong> on {pendingDeleteJob?.platform}?{' '}
            {pendingDeleteJob?.platform === 'Adzuna'
              ? 'This will deactivate the advertisement on Adzuna.'
              : 'This action is permanent and will remove the advertisement from the live site immediately.'}
          </DialogContentText>
          {needsReason && (
            <input
              type="text"
              className={styles.reasonInput}
              aria-label="Reason for deleting"
              placeholder="Reason for deleting, e.g. Position filled"
              maxLength={200}
              value={deleteReason}
              onChange={(event) => setDeleteReason(event.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions className={styles.confirmDialogActions}>
          <ButtonBase
            className={styles.dialogCancelBtn}
            onClick={() => setPendingDeleteJob(null)}
            disableRipple
          >
            Cancel
          </ButtonBase>
          <ButtonBase
            className={styles.dialogDeleteBtn}
            onClick={handleConfirmDelete}
            disabled={needsReason && !deleteReason.trim()}
            disableRipple
          >
            Delete
          </ButtonBase>
        </DialogActions>
      </Dialog>
    </div>
  )
}
