import { Box } from "@mui/material";
import facebookIcon from "@/assets/public-layout/social-facebook.svg";
import instagramIcon from "@/assets/public-layout/social-instagram.svg";
import linkedinIcon from "@/assets/public-layout/social-linkedin.svg";
import styles from "./PublicSocialLinks.module.css";

const socialLinks = [
  { label: "LinkedIn", icon: linkedinIcon },
  { label: "Facebook", icon: facebookIcon },
  { label: "Instagram", icon: instagramIcon },
];

type PublicSocialLinksProps = {
  className?: string;
};

export const PublicSocialLinks = ({
  className = "",
}: PublicSocialLinksProps) => (
  <Box
    component="nav"
    aria-label="Social media"
    className={`${styles.socialLinks} ${className}`}
  >
    {socialLinks.map(({ label, icon }) => (
      <Box
        key={label}
        component="a"
        href="#"
        aria-label={label}
        onClick={(event) => event.preventDefault()}
        className={styles.socialLink}
      >
        <Box component="img" src={icon} alt="" />
      </Box>
    ))}
  </Box>
);
