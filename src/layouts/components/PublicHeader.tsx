import { Box, Button, IconButton } from "@mui/material";
import type { MouseEvent } from "react";
import { NavLink } from "react-router-dom";
import searchIcon from "@/assets/landing-page/search-icon.svg";
import skillsMineLogo from "@/assets/skillsMine-logo.svg";
import userIcon from "@/assets/public-layout/user-icon.svg";
import { ROUTE_PATHS } from "@/routes/routePaths";
import styles from "../PublicLayout.module.css";

type PublicHeaderProps = {
  showHelpButton?: boolean;
  showExploreJobs?: boolean;
  showDashboard?: boolean;
  showSkillsBuild?: boolean;
  showSignIn?: boolean;
  showSignUp?: boolean;
  showProfileBadge?: boolean;
  showSearchButton?: boolean;
  canAccessProtectedRoutes: boolean;
  onProtectedNavClick: (event: MouseEvent<HTMLAnchorElement>, targetPath: string) => void;
  onHelpClick: () => void;
  onSignUpClick: () => void;
  onSearchClick: () => void;
};

export const PublicHeader = ({
  showHelpButton = false,
  showExploreJobs = false,
  showDashboard = false,
  showSkillsBuild = false,
  showSignIn = false,
  showSignUp = false,
  showProfileBadge = false,
  showSearchButton = false,
  canAccessProtectedRoutes,
  onProtectedNavClick,
  onHelpClick,
  onSignUpClick,
  onSearchClick,
}: PublicHeaderProps) => {
  return (
    <Box component="header" className={styles.topBar}>
      <Box className={styles.topBarInner}>
        <Box
          component={NavLink}
          to={ROUTE_PATHS.landing}
          aria-label="Go to landing page"
          className={styles.logoLink}
        >
          <Box
            component="img"
            src={skillsMineLogo}
            alt="SkillsMine"
            className={styles.logoPrimary}
          />
        </Box>

        {showHelpButton ? (
          <Button
            variant="text"
            onClick={onHelpClick}
            className={styles.helpButton}
          >
            Need help?
          </Button>
        ) : (
          <Box className={styles.navGroup}>
            {showExploreJobs ? (
              <Box
                component={NavLink}
                to={ROUTE_PATHS.jobs}
                aria-disabled={!canAccessProtectedRoutes}
                onClick={(event) => onProtectedNavClick(event, ROUTE_PATHS.jobs)}
                className={styles.navItemMuted}
              >
                Explore Jobs
              </Box>
            ) : null}
            {showDashboard ? (
              <Box
                component={NavLink}
                to={ROUTE_PATHS.dashboard}
                aria-disabled={!canAccessProtectedRoutes}
                onClick={(event) => onProtectedNavClick(event, ROUTE_PATHS.dashboard)}
                className={styles.navItemMuted}
              >
                Dashboard
              </Box>
            ) : null}
            {showSkillsBuild ? (
              <Box
                component={NavLink}
                to={ROUTE_PATHS.landing}
                className={styles.navItemActive}
              >
                Skills Build
              </Box>
            ) : null}
            {showSignIn ? (
              <Box
                component={NavLink}
                to={ROUTE_PATHS.login}
                className={styles.navItemStrong}
              >
                Sign in
              </Box>
            ) : null}
            {showSignUp ? (
              <Button
                variant="contained"
                onClick={onSignUpClick}
                className={styles.signUpButton}
              >
                Sign up
              </Button>
            ) : null}
            {showProfileBadge ? (
              <Box
                component="span"
                aria-hidden="true"
                className={styles.profileBadge}
              >
                <Box
                  component="img"
                  src={userIcon}
                  alt=""
                  className={styles.profileIcon}
                />
              </Box>
            ) : null}
            {showSearchButton ? (
              <IconButton
                aria-label="Search site"
                onClick={onSearchClick}
                className={styles.searchButton}
              >
                <Box
                  component="img"
                  src={searchIcon}
                  alt=""
                  className={styles.searchButtonIcon}
                />
              </IconButton>
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );
};
