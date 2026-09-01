import { useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import styles from './OfferStageModal.module.css'

// ── Icons ──────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="#57606a" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#6B7280" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="#6B7280" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Props ──────────────────────────────────────────────────────────────

export interface OfferStageModalProps {
  candidateName: string
  candidateTitle: string
  company: string
  dueDate?: string
  onClose: () => void
}

// ── Component ──────────────────────────────────────────────────────────

const OfferStageModal = ({
  candidateName,
  candidateTitle,
  company,
  dueDate = 'Jan 20, 2026',
  onClose,
}: OfferStageModalProps) => {
  const [offerDate, setOfferDate] = useState('17 August 2026')
  const [ctcTotal, setCtcTotal] = useState('850000')

  return (
    <Box className={styles.backdrop} onClick={onClose}>
      <Box
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Offer stage details for ${candidateName}`}
      >
        {/* ── Close button row ── */}
        <Box className={styles.closeBtnRow}>
          <ButtonBase className={styles.closeBtn} onClick={onClose} disableRipple aria-label="Close">
            <CloseIcon />
          </ButtonBase>
        </Box>

        {/* ── Stage banner ── */}
        <Box className={styles.stageBanner}>
          <Typography component="h2" className={styles.stageBannerText}>
            Offer
          </Typography>
        </Box>

        {/* ── Padded content ── */}
        <Box className={styles.content}>
          {/* ── Candidate name ── */}
          <Typography component="h3" className={styles.candidateName}>
            {candidateName}
          </Typography>

          {/* ── Job title + company ── */}
          <Typography component="p" className={styles.jobInfo}>
            {candidateTitle}, {company}
          </Typography>

          {/* ── Due date ── */}
          <Box className={styles.dueDateRow}>
            <CalendarIcon />
            <Typography component="span" className={styles.dueDate}>
              Due {dueDate}
            </Typography>
          </Box>

          {/* ── Form section ── */}
          <Box className={styles.formSection}>
            <Typography component="p" className={styles.formSectionLabel}>
              Offer Extension Details
            </Typography>

            <Box className={styles.formRow}>
              {/* Offer Extension Date */}
              <Box className={styles.fieldGroup}>
                <Typography component="label" className={styles.fieldLabel} htmlFor="offer-ext-date-offer">
                  Offer Extension Date *
                </Typography>
                <Box className={styles.inputWrapper}>
                  <input
                    id="offer-ext-date-offer"
                    type="text"
                    className={styles.input}
                    value={offerDate}
                    onChange={e => setOfferDate(e.target.value)}
                  />
                  <Box className={styles.inputIcon}>
                    <CalendarIcon />
                  </Box>
                </Box>
              </Box>

              {/* Cost-to-Company Total */}
              <Box className={styles.fieldGroup}>
                <Typography component="label" className={styles.fieldLabel} htmlFor="ctc-total-offer">
                  Cost-to-Company Total (ZAR) *
                </Typography>
                <input
                  id="ctc-total-offer"
                  type="text"
                  className={styles.input}
                  value={ctcTotal}
                  onChange={e => setCtcTotal(e.target.value)}
                />
              </Box>
            </Box>
          </Box>

          {/* ── Divider ── */}
          <Box className={styles.footerDivider} />

          {/* ── Action buttons ── */}
          <Box className={styles.actionRow}>
            <ButtonBase className={styles.moveBackBtn} disableRipple disabled>
              Move back
            </ButtonBase>
            <ButtonBase className={styles.rejectBtn} disableRipple>
              Reject
            </ButtonBase>
            <ButtonBase className={styles.advanceBtn} disableRipple>
              Advance
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default OfferStageModal
