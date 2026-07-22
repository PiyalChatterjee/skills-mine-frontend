import { Box, Button, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";
import skillsMineLogo from "@/assets/skillsMine-logo.svg";
import styles from "./PublicLayout.module.css";

export const PublicLayout = () => {
  return (
    <Box className={styles.layoutRoot}>
      <Box className={styles.topBar}>
        <Box className={styles.topBarInner}>
          <Box
            component="img"
            src={skillsMineLogo}
            alt="SkillsMine"
            className={styles.logoPrimary}
          />
          <Button variant="text" className={styles.helpButton}>
            Need help?
          </Button>
        </Box>
      </Box>

      <Box component="main" className={styles.contentArea}>
        <Outlet />
      </Box>

      <Box className={styles.footerBar}>
        <Box className={styles.footerInner}>
          <Box className={styles.footerBrandBlock}>
            <Box
              component="img"
              src={skillsMineLogo}
              alt="SkillsMine"
              className={styles.logoFooter}
            />
            <Typography className={styles.copyrightText}>© 2026</Typography>
          </Box>
          <Box className={styles.footerLinks}>
            <Typography className={styles.footerLinkText}>Privacy</Typography>
            <Typography className={styles.footerLinkText}>Terms</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
