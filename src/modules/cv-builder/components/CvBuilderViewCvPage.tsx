import { Box, Button } from "@mui/material";
import { useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { CvBuilderFormValues } from "../types/cvBuilderSchema";
import CvBuilderPreviewDocument from "./CvBuilderPreviewDocument";
import styles from "../pages/CvBuilderPage.module.css";
import { downloadCvPdf } from "../utils/downloadCvPdf";

type CvBuilderViewCvPageProps = Record<string, never>;

const CvBuilderViewCvPage = (_: CvBuilderViewCvPageProps) => {
  const { control } = useFormContext<CvBuilderFormValues>();
  const formValues = useWatch({ control, name: "personalDetails" });
  const careerHistory = useWatch({ control, name: "careerHistory" }) ?? [];
  const skills = useWatch({ control, name: "skills" }) ?? [];
  const tertiary = useWatch({ control, name: "tertiaryEducation" }) ?? [];
  const secondary = useWatch({ control, name: "secondaryEducation" }) ?? [];
  const languages = useWatch({ control, name: "languages" }) ?? [];
  const otherLanguage = useWatch({ control, name: "otherLanguage" }) ?? "";
  const selectedLanguageEntries = [
    ...languages.filter((l: string) => l !== "Other"),
    ...(languages.includes("Other") && otherLanguage.trim()
      ? [otherLanguage.trim()]
      : []),
  ];
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
                  tertiaryEducation={tertiary}
                  secondaryEducation={secondary}
                  selectedLanguageEntries={selectedLanguageEntries}
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
