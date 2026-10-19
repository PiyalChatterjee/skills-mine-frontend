import { Box } from "@mui/material";
import { RecruiterSidebar } from "@/modules/recruiter/components/RecruiterSidebar";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  MancoAttentionSection,
  MancoCrmCard,
  MancoPageHeader,
  MancoRecruiterSection,
} from "./RecruiterMancoSections";
import styles from "./RecruiterMancoPage.module.css";

const RecruiterMancoPage = () => {
  usePageTitle("MANCO Dashboard");

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />
      <Box className={styles.pageRoot}>
        <MancoPageHeader />
        <Box className={styles.topBanner}>
          <MancoAttentionSection />
          <MancoCrmCard />
        </Box>
        <MancoRecruiterSection />
      </Box>
    </Box>
  );
};

export default RecruiterMancoPage;
