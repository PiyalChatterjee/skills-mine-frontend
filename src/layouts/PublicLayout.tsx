import { Box } from "@mui/material";
import type { MouseEvent } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { isJwtExpired } from "@/app/auth/jwt";
import { PUBLIC_HEADER_NAV_PRESETS, buildHeaderNavItems } from "@/layouts/headerNav";
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

  const navItems = isLoginPage
    ? []
    : isLandingPage
      ? buildHeaderNavItems({
          keys: PUBLIC_HEADER_NAV_PRESETS.landing,
          pathname: location.pathname,
        })
      : isHiringLandingMode
        ? []
        : buildHeaderNavItems({
            keys: PUBLIC_HEADER_NAV_PRESETS.discovery,
            pathname: location.pathname,
          });

  return (
    <Box className={styles.layoutRoot}>
      <PublicHeader
        canAccessProtectedRoutes={canAccessProtectedRoutes}
        navItems={navItems}
        onProtectedNavClick={handleProtectedNavClick}
        onHelpClick={handleHelpClick}
        onSignUpClick={handleSignUpClick}
        onSearchClick={handleSearchClick}
        showHelpButton={isLoginPage}
        showProfileBadge={!isLoginPage && !isLandingPage && !isHiringLandingMode}
        showSearchButton={!isLoginPage && !isLandingPage && !isHiringLandingMode}
        showSignUp={!isLoginPage}
      />

      <Box component="main" className={styles.contentArea}>
        <Outlet />
      </Box>

      <PublicFooter showContactLink={!isLoginPage} />
    </Box>
  );
};
