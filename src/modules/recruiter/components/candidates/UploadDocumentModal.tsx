import { useRef, useState } from 'react'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import styles from './UploadDocumentModal.module.css'

// ── Icons ──────────────────────────────────────────────────────────────

const UploadModalIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
      stroke="#d45f5f"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ModalDocIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
      stroke="#57606a"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
      stroke="#57606a"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ModalTrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"
      fill="#b0b4b8"
    />
  </svg>
)

// ── Types ──────────────────────────────────────────────────────────────

export interface UploadDocumentModalProps {
  open: boolean
  onClose: () => void
  /** Return a promise; the modal shows a spinner until it resolves/rejects. */
  onDone: (file: File) => Promise<void>
}

// ── Component ──────────────────────────────────────────────────────────

export const UploadDocumentModal = ({ open, onClose, onDone }: UploadDocumentModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleCancel = () => {
    if (uploading) return
    setSelectedFile(null)
    setUploadError(null)
    onClose()
  }

  const handleDone = () => {
    if (!selectedFile || uploading) return
    setUploadError(null)
    setUploading(true)
    onDone(selectedFile)
      .then(() => {
        setSelectedFile(null)
        setUploading(false)
      })
      .catch(() => {
        setUploadError('Upload failed. Please try again.')
        setUploading(false)
      })
  }

  if (!open) return null

  return (
    <Box className={styles.overlay} role="dialog" aria-modal="true" aria-label="Upload document">
      <Box className={styles.card}>

        {/* ── Header ── */}
        <Box className={styles.header}>
          <Box className={styles.iconWrap}>
            <UploadModalIcon />
          </Box>
          <Typography component="h2" className={styles.title}>
            Upload Document
          </Typography>
          <ButtonBase className={styles.closeBtn} onClick={handleCancel} disableRipple aria-label="Close modal">
            ×
          </ButtonBase>
        </Box>

        <Box className={styles.divider} />

        {/* ── Body ── */}
        {selectedFile ? (
          /* uploaded state */
          <Box className={styles.body}>
            <Box className={styles.fileRow}>
              <ModalDocIcon />
              <Typography component="span" className={styles.fileName}>
                {selectedFile.name}
              </Typography>
              <ButtonBase
                className={styles.fileRemoveBtn}
                disableRipple
                aria-label="Remove file"
                onClick={() => setSelectedFile(null)}
              >
                <ModalTrashIcon />
              </ButtonBase>
            </Box>
          </Box>
        ) : (
          /* browse state */
          <Box className={styles.body}>
            <Box
              className={`${styles.dropZone} ${dragging ? styles.dropZoneDragging : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Typography component="p" className={styles.dropText}>
                Choose a file or drag and drop it here
              </Typography>
              <Typography component="p" className={styles.dropHint}>
                PDF and DOC formats only, up to 5mb
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                aria-label="File input"
              />
              <ButtonBase
                className={styles.browseBtn}
                disableRipple
                onClick={() => fileInputRef.current?.click()}
              >
                Browse file
              </ButtonBase>
            </Box>
          </Box>
        )}

        {/* ── Error message ── */}
        {uploadError && (
          <Typography className={styles.errorText}>
            {uploadError}
          </Typography>
        )}

        {/* ── Footer ── */}
        <Box className={styles.footer}>
          <ButtonBase
            className={styles.cancelBtn}
            disableRipple
            onClick={handleCancel}
            disabled={uploading}
          >
            Cancel
          </ButtonBase>
          <ButtonBase
            className={`${styles.doneBtn} ${!selectedFile || uploading ? styles.doneBtnDisabled : ''}`}
            disableRipple
            disabled={!selectedFile || uploading}
            onClick={handleDone}
          >
            {uploading ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : 'Done'}
          </ButtonBase>
        </Box>

      </Box>
    </Box>
  )
}

export default UploadDocumentModal
