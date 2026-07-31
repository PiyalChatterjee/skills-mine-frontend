import { Box } from "@mui/material";
import { useState, type MouseEvent } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { isJwtExpired } from "@/app/auth/jwt";
import { PUBLIC_HEADER_NAV_PRESETS, buildHeaderNavItems } from "@/layouts/headerNav";
import { CandidateSignUpDrawer } from "@/modules/public/components/CandidateSignUpDrawer";
import { RecruiterSignUpDrawer } from "@/modules/public/components/RecruiterSignUpDrawer";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { RootState } from "@/store";
import { PublicFooter } from "./components/PublicFooter";
import { PublicHeader } from "./components/PublicHeader";
import styles from "./PublicLayout.module.css";

export type PublicLayoutOutletContext = {
  openSignUpDrawer: () => void;
};

export const PublicLayout = () => {
  const [isSignUpDrawerOpen, setSignUpDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, tokens } = useAuth();
  const isLoginPage = location.pathname === ROUTE_PATHS.login;
  const isSignupPage = location.pathname === ROUTE_PATHS.signup;
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
    setSignUpDrawerOpen(true);
  };

  const handleSignUpDrawerClose = () => {
    setSignUpDrawerOpen(false);
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
    : isSignupPage
      ? buildHeaderNavItems({
          keys: PUBLIC_HEADER_NAV_PRESETS.landing,
          pathname: location.pathname,
        })
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
        showProfileBadge={
          !isLoginPage && !isSignupPage && !isLandingPage && !isHiringLandingMode
        }
        showSearchButton={
          !isLoginPage && !isSignupPage && !isLandingPage && !isHiringLandingMode
        }
        showSignUp={!isLoginPage && !isSignupPage}
      />

      <Box component="main" className={styles.contentArea}>
        <Outlet
          context={{
            openSignUpDrawer: handleSignUpClick,
          }}
        />
      </Box>

      <PublicFooter showContactLink={!isLoginPage} />

      {isHiringLandingMode ? (
        <RecruiterSignUpDrawer
          open={isSignUpDrawerOpen}
          onClose={handleSignUpDrawerClose}
        />
      ) : (
        <CandidateSignUpDrawer
          open={isSignUpDrawerOpen}
          onClose={handleSignUpDrawerClose}
        />
      )}
    </Box>
  );
};
