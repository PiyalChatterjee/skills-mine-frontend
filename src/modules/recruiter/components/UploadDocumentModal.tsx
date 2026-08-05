import { useRef, useState, useCallback } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import styles from './UploadDocumentModal.module.css'

// ── Icons ──────────────────────────────────────────────────────────────

const UploadCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#E05252" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 8l-5-5-5 5M12 3v12" stroke="#E05252" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="#57606a" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const FileDocIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#57606a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#57606a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z" fill="#B0B4B8"/>
  </svg>
)

const UploadAreaIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 8l-5-5-5 5M12 3v12" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Types ──────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
  onDone: (file: File, docName: string) => void
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['.pdf', '.doc', '.docx']
const ACCEPT_ATTR = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

// ── Component ──────────────────────────────────────────────────────────

const UploadDocumentModal = ({ onClose, onDone }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docName, setDocName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  const validateAndSet = useCallback((file: File) => {
    setError('')
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED.includes(ext)) {
      setError('Only PDF and DOC/DOCX files are accepted.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File exceeds the 5 MB limit.')
      return
    }
    setSelectedFile(file)
    // Pre-fill document name with filename (without extension)
    setDocName(file.name.replace(/\.[^/.]+$/, ''))
  }, [])

  const handleBrowse = () => fileInputRef.current?.click()

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSet(file)
    // Reset so same file can be re-selected after delete
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSet(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setDocName('')
    setError('')
  }

  const handleDone = () => {
    if (!selectedFile) return
    onDone(selectedFile, docName.trim() || selectedFile.name)
  }

  const canSubmit = selectedFile !== null

  return (
    /* Backdrop */
    <Box className={styles.backdrop} onClick={onClose}>
      {/* Modal panel — stop click propagation so backdrop click doesn't close when clicking inside */}
      <Box className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Upload document">

        {/* ── Header ── */}
        <Box className={styles.header}>
          <Box className={styles.headerLeft}>
            <Box className={styles.iconCircle}><UploadCircleIcon /></Box>
            <Typography component="h2" className={styles.title}>Upload document</Typography>
          </Box>
          <ButtonBase className={styles.closeBtn} onClick={onClose} disableRipple aria-label="Close">
            <CloseIcon />
          </ButtonBase>
        </Box>

        <Box className={styles.divider} />

        {/* ── Body ── */}
        <Box className={styles.body}>
          {!selectedFile ? (
            /* ── Drop zone ── */
            <Box
              className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <UploadAreaIcon />
              <Typography className={styles.dropPrimary}>Choose a file or drag and drop it here</Typography>
              <Typography className={styles.dropSecondary}>PDF and DOC formats only, up to 5 MB</Typography>
              <ButtonBase className={styles.browseBtn} onClick={handleBrowse} disableRipple>
                Browse file
              </ButtonBase>
              {error && <Typography className={styles.errorText}>{error}</Typography>}
            </Box>
          ) : (
            /* ── File selected state ── */
            <Box className={styles.selectedState}>
              {/* Document name input */}
              <Box className={styles.docNameField}>
                <Typography component="label" htmlFor="doc-name-input" className={styles.docNameLabel}>
                  Document name
                </Typography>
                <input
                  id="doc-name-input"
                  type="text"
                  className={styles.docNameInput}
                  placeholder="e.g. CV"
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                />
              </Box>

              <Box className={styles.divider} />

              {/* File card */}
              <Box className={styles.fileCard}>
                <FileDocIcon />
                <Typography className={styles.fileName}>{selectedFile.name}</Typography>
                <ButtonBase className={styles.deleteBtn} onClick={handleRemoveFile} disableRipple aria-label="Remove file">
                  <TrashIcon />
                </ButtonBase>
              </Box>
            </Box>
          )}
        </Box>

        <Box className={styles.divider} />

        {/* ── Footer ── */}
        <Box className={styles.footer}>
          <ButtonBase className={styles.cancelBtn} onClick={onClose} disableRipple>
            Cancel
          </ButtonBase>
          <ButtonBase
            className={`${styles.doneBtn} ${canSubmit ? styles.doneBtnActive : ''}`}
            onClick={handleDone}
            disableRipple
            disabled={!canSubmit}
          >
            Done
          </ButtonBase>
        </Box>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTR}
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
      </Box>
    </Box>
  )
}

export default UploadDocumentModal
