import { Box, Typography } from "@mui/material";
import skillsMineLogo from "@/assets/skillsMine-logo.svg";
import styles from "../PublicLayout.module.css";

type PublicFooterProps = {
  showContactLink?: boolean;
};

export const PublicFooter = ({ showContactLink = true }: PublicFooterProps) => {
  return (
    <Box component="footer" className={styles.footerBar}>
      <Box className={styles.footerInner}>
        <Box className={styles.footerBrandBlock}>
          <Box
            component="img"
            src={skillsMineLogo}
            alt="SkillsMine"
            className={styles.logoFooter}
          />
          <Typography
            component="p"
            className={styles.copyrightText}
          >
            © 2026
          </Typography>
        </Box>
        <Box className={styles.footerLinks}>
          <Typography component="p" className={styles.footerLinkText}>
            Privacy
          </Typography>
          <Typography component="p" className={styles.footerLinkText}>
            Terms and Conditions
          </Typography>
          {showContactLink ? (
            <Typography component="p" className={styles.footerLinkText}>
              Contact
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};
