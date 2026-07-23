import { Box } from "@mui/material";
import type { MouseEvent } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { isJwtExpired } from "@/app/auth/jwt";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { RootState } from "@/store";
import { PublicFooter } from "./components/PublicFooter";
import { PublicHeader } from "./components/PublicHeader";
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

  const headerVisibility = isLoginPage
    ? {
        showHelpButton: true,
        showExploreJobs: false,
        showDashboard: false,
        showSkillsBuild: false,
        showSignIn: false,
        showSignUp: false,
        showProfileBadge: false,
        showSearchButton: false,
      }
    : isLandingPage
      ? {
          showHelpButton: false,
          showExploreJobs: false,
          showDashboard: false,
          showSkillsBuild: false,
          showSignIn: true,
          showSignUp: true,
          showProfileBadge: false,
          showSearchButton: false,
        }
      : {
          showHelpButton: false,
          showExploreJobs: !isHiringLandingMode,
          showDashboard: !isHiringLandingMode,
          showSkillsBuild: true,
          showSignIn: true,
          showSignUp: true,
          showProfileBadge: !isHiringLandingMode,
          showSearchButton: !isHiringLandingMode,
        };

  return (
    <Box className={styles.layoutRoot}>
      <PublicHeader
        canAccessProtectedRoutes={canAccessProtectedRoutes}
        onProtectedNavClick={handleProtectedNavClick}
        onHelpClick={handleHelpClick}
        onSignUpClick={handleSignUpClick}
        onSearchClick={handleSearchClick}
        {...headerVisibility}
      />

      <Box component="main" className={styles.contentArea}>
        <Outlet />
      </Box>

      <PublicFooter showContactLink={!isLoginPage} />
    </Box>
  );
};
