import { Box } from "@mui/material";
import facebookIcon from "@/assets/public-layout/social-facebook.svg";
import instagramIcon from "@/assets/public-layout/social-instagram.svg";
import linkedinIcon from "@/assets/public-layout/social-linkedin.svg";
import styles from "./PublicSocialLinks.module.css";

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/the-skills-mine/",
    icon: linkedinIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/theskillsmine",
    icon: facebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/theskillsmine/",
    icon: instagramIcon,
  },
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
    {socialLinks.map(({ label, href, icon }) => (
      <Box
        key={label}
        component="a"
        href={href}
        aria-label={label}
        className={styles.socialLink}
      >
        <Box component="img" src={icon} alt="" />
      </Box>
    ))}
  </Box>
);
