import { Box, Button, IconButton, Typography } from "@mui/material";
import type { MouseEvent } from "react";
import { useSelector } from "react-redux";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { isJwtExpired } from "@/app/auth/jwt";
import searchIcon from "@/assets/landing-page/search-icon.svg";
import skillsMineLogo from "@/assets/skillsMine-logo.svg";
import userIcon from "@/assets/public-layout/user-icon.svg";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { RootState } from "@/store";
import styles from "./PublicLayout.module.css";

export const PublicLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, tokens } = useAuth();
  const isLoginPage = location.pathname === ROUTE_PATHS.login;
  const landingMode = useSelector((state: RootState) => state.ui.landingMode);
  const isLandingPage = location.pathname === ROUTE_PATHS.landing;
  const isHiringLandingMode = isLandingPage && landingMode === "startHiring";
  const accessToken = tokens?.accessToken;
  const hasValidAccessToken = accessToken ? !isJwtExpired(accessToken) : false;
  const canAccessProtectedRoutes = isAuthenticated && hasValidAccessToken;

  const handleHelpClick = () => {
    // TODO: Implement action
  };

  const handleSignUpClick = () => {
    // TODO: Implement action
  };

  const handleSearchClick = () => {
    // TODO: Implement action
  };

  const handleProtectedNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    targetPath: string,
  ) => {
    if (canAccessProtectedRoutes) {
      return;
    }

    event.preventDefault();
    navigate(ROUTE_PATHS.login, { state: { from: targetPath } });
  };

  return (
    <Box className={styles.layoutRoot}>
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

          {isLoginPage ? (
            <Button
              variant="text"
              onClick={handleHelpClick}
              className={styles.helpButton}
            >
              Need help?
            </Button>
          ) : (
            <Box className={styles.navGroup}>
              {!isHiringLandingMode ? (
                <Box
                  component={NavLink}
                  to={ROUTE_PATHS.jobs}
                  aria-disabled={!canAccessProtectedRoutes}
                  onClick={(event) => handleProtectedNavClick(event, ROUTE_PATHS.jobs)}
                  className={styles.navItemMuted}
                >
                  Explore Jobs
                </Box>
              ) : null}
              {!isHiringLandingMode ? (
                <Box
                  component={NavLink}
                  to={ROUTE_PATHS.dashboard}
                  aria-disabled={!canAccessProtectedRoutes}
                  onClick={(event) =>
                    handleProtectedNavClick(event, ROUTE_PATHS.dashboard)
                  }
                  className={styles.navItemMuted}
                >
                  Dashboard
                </Box>
              ) : null}
              <Box
                component={NavLink}
                to={ROUTE_PATHS.landing}
                className={styles.navItemActive}
              >
                Skills Build
              </Box>
              <Box
                component={NavLink}
                to={ROUTE_PATHS.login}
                className={styles.navItemStrong}
              >
                Sign in
              </Box>
              <Button
                variant="contained"
                onClick={handleSignUpClick}
                className={styles.signUpButton}
              >
                Sign up
              </Button>
              {!isHiringLandingMode ? (
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
              {!isHiringLandingMode ? (
                <IconButton
                  aria-label="Search site"
                  onClick={handleSearchClick}
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

      <Box component="main" className={styles.contentArea}>
        <Outlet />
      </Box>

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
            {!isLoginPage ? (
              <Typography component="p" className={styles.footerLinkText}>
                Contact
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
