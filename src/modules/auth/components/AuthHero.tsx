import { Box, Typography } from "@mui/material";
import loginFaceImage from "@/assets/login-face-img.jpg";
import loginVectorImage from "@/assets/login-vector.svg";
import styles from "./AuthHero.module.css";

interface AuthHeroProps {
  headline: string;
  headlineClassName?: string;
}

const AuthHero = ({ headline, headlineClassName }: AuthHeroProps) => {
  return (
    <Box className={styles.heroSection}>
      <Box
        component="img"
        src={loginVectorImage}
        alt=""
        className={styles.heroVector}
      />
      <Box
        component="img"
        src={loginFaceImage}
        alt=""
        className={styles.heroPortrait}
      />
      <Box className={styles.heroOverlay} />

      <Box className={styles.heroHeadlineWrap}>
        <Typography
          className={[styles.heroHeadline, headlineClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {headline}
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthHero;
