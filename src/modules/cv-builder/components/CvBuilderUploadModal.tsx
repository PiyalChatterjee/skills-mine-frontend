import { Box, ButtonBase, Typography } from "@mui/material";
import { useState } from "react";
import uploadIcon from "@/assets/cv-builder/upload-2-line.svg";
import closeIcon from "@/assets/cv-builder/close-line.svg";
import fileIcon from "@/assets/cv-builder/file-transfer-line.svg";
import styles from "../pages/CvBuilderPage.module.css";

type CvBuilderUploadModalProps = {
  selectedFile: File | null;
  onSelectFile: (file: File | null) => void;
  onBrowse: () => void;
  onClose: () => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx"];

const CvBuilderUploadModal = ({
  selectedFile,
  onSelectFile,
  onBrowse,
  onClose,
}: CvBuilderUploadModalProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const selectFile = (file: File | undefined) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setError("Only PDF and DOC/DOCX files are accepted.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds the 5 MB limit.");
      return;
    }
    setError("");
    onSelectFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    selectFile(event.dataTransfer.files[0]);
  };

  return (
    <Box className={styles.uploadModalBackdrop} onClick={onClose}>
      <Box
        className={styles.uploadModal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-cv-title"
      >
        <ButtonBase
          className={styles.uploadModalClose}
          onClick={onClose}
          aria-label="Close upload dialog"
          disableRipple
        >
          <Box component="img" src={closeIcon} alt="" />
        </ButtonBase>

        <Box className={styles.uploadModalContent}>
          <Box className={styles.uploadModalHeading}>
            <Box className={styles.uploadModalIcon}>
              <Box component="img" src={uploadIcon} alt="" />
            </Box>
            <Typography component="h2" id="upload-cv-title">
              Upload my CV
            </Typography>
          </Box>

          <Box className={styles.uploadModalDivider} />

          {!selectedFile ? (
            <Box
              className={`${styles.uploadDropZone} ${dragOver ? styles.uploadDropZoneActive : ""}`}
              onDrop={handleDrop}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
            >
              <Typography>Choose a file or drag and drop it here</Typography>
              <Typography>PDF and DOC formats only, up to 5mb</Typography>
              <ButtonBase className={styles.uploadBrowseButton} onClick={onBrowse} disableRipple>
                Browse file
              </ButtonBase>
              {error && <Typography className={styles.uploadError}>{error}</Typography>}
            </Box>
          ) : (
            <Box className={styles.uploadFileRow}>
              <Box className={styles.uploadFileDetails}>
                <Box component="img" src={fileIcon} alt="" />
                <Typography title={selectedFile.name}>{selectedFile.name}</Typography>
              </Box>
              <ButtonBase
                className={styles.uploadDeleteButton}
                onClick={() => onSelectFile(null)}
                aria-label="Remove selected file"
                disableRipple
              >
                <Box component="img" src={closeIcon} alt="" />
              </ButtonBase>
            </Box>
          )}

          <Box className={styles.uploadModalDivider} />

          <Box className={styles.uploadModalFooter}>
            <ButtonBase className={styles.uploadCancelButton} onClick={onClose} disableRipple>
              Cancel
            </ButtonBase>
            <ButtonBase
              className={`${styles.uploadDoneButton} ${selectedFile ? styles.uploadDoneButtonActive : ""}`}
              onClick={onClose}
              disabled={!selectedFile}
              disableRipple
            >
              Done
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CvBuilderUploadModal;