import { Box, Button } from "@mui/material";
import { useRef } from "react";
import type {
  CareerHistoryEntry,
  Language,
  PersonalDetailsFormState,
  SecondaryEducationEntry,
  SkillEntry,
  TertiaryEducationEntry,
} from "../types/cvBuilder";
import CvBuilderPreviewDocument from "./CvBuilderPreviewDocument";
import styles from "../pages/CvBuilderPage.module.css";
import { downloadCvPdf } from "../utils/downloadCvPdf";

type CvBuilderViewCvPageProps = {
  formValues: PersonalDetailsFormState;
  careerHistory: CareerHistoryEntry[];
  skills: SkillEntry[];
  tertiaryEducation: TertiaryEducationEntry[];
  secondaryEducation: SecondaryEducationEntry[];
  selectedLanguages: Set<Language>;
};

const CvBuilderViewCvPage = ({
  formValues,
  careerHistory,
  skills,
  tertiaryEducation,
  secondaryEducation,
  selectedLanguages,
}: CvBuilderViewCvPageProps) => {
  const previewDocumentRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadPdf = async () => {
    const documentNode = previewDocumentRef.current;
    if (!documentNode) {
      return;
    }

    await downloadCvPdf(documentNode);
  };

  return (
    <Box className={styles.viewCvPageWrap}>
      <Box className={styles.viewCvTopRow}>
        <Box className={styles.viewCvDocumentColumn}>
          <Box className={styles.viewCvDocumentScrollArea}>
            <Box className={styles.previewPageFrame}>
              <Box ref={previewDocumentRef}>
                <CvBuilderPreviewDocument
                  size="full"
                  formValues={formValues}
                  careerHistory={careerHistory}
                  skills={skills}
                  tertiaryEducation={tertiaryEducation}
                  secondaryEducation={secondaryEducation}
                  selectedLanguages={selectedLanguages}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className={styles.viewCvActionColumn}>
          <Button
            type="button"
            className={styles.previewPageDownloadButton}
            disableRipple
            onClick={handleDownloadPdf}
          >
            Download
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CvBuilderViewCvPage;
