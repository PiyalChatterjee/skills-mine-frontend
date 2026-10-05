import { Box } from "@mui/material";
import { useEffect, useState, type MouseEvent } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { isJwtExpired } from "@/app/auth/jwt";
import { completeLogoutNavigation } from "@/app/auth/logoutNavigation";
import {
  PUBLIC_HEADER_NAV_PRESETS,
  buildHeaderNavItems,
  getRoleHeaderNavKeys,
  type HeaderNavActionMap,
} from "@/layouts/headerNav";
import { OpportunitySearchModal } from "@/modules/candidate/components/OpportunitySearchModal";
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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, tokens, user } = useAuth();
  const isLoginPage = location.pathname === ROUTE_PATHS.login;
  const isSignupPage =
    location.pathname === ROUTE_PATHS.signup ||
    location.pathname === ROUTE_PATHS.recruiterSignup;
  const isResetPasswordPage = location.pathname === ROUTE_PATHS.resetPassword;
  const landingMode = useSelector((state: RootState) => state.ui.landingMode);
  const isLandingPage = location.pathname === ROUTE_PATHS.landing;
  const isHiringLandingMode = isLandingPage && landingMode === "startHiring";
  // Set by the CV builder after a visitor applies, so sign-up converts that visitor into a candidate.
  // Snapshotted once so it survives LandingPage clearing location.state (e.g. on a hard refresh).
  const [visitorId] = useState(
    () => (location.state as { visitorId?: string } | null)?.visitorId,
  );
  const accessToken = tokens?.accessToken;
  const hasValidAccessToken = accessToken ? !isJwtExpired(accessToken) : false;
  const canAccessProtectedRoutes = isAuthenticated && hasValidAccessToken;
  const shouldUseAuthHeaderVariant =
    isResetPasswordPage && canAccessProtectedRoutes;
  const shouldUseLoginHeaderVariant =
    isLoginPage || (isResetPasswordPage && !canAccessProtectedRoutes);

  useEffect(() => {
    setSignUpDrawerOpen(false);

    if (location.pathname === ROUTE_PATHS.landing) {
      completeLogoutNavigation();
    }
  }, [location.pathname, location.search]);

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
    setIsSearchModalOpen(true);
  };

  const handleSavedJobPostsClick = () => {
    navigate(ROUTE_PATHS.savedJobs);
  };

  const handleCvBuilderClick = () => {
    navigate(ROUTE_PATHS.cvBuilder);
  };

  const handleSkillsBuildClick = () => {
    // TODO: Implement skills build navigation
  };

  const handleNotificationClick = () => {
    // TODO: Implement notifications panel
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

  const navItems = shouldUseLoginHeaderVariant
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

  const candidateHeaderActions: HeaderNavActionMap = {
    savedJobPosts: handleSavedJobPostsClick,
    cvBuilder: handleCvBuilderClick,
    skillsBuild: handleSkillsBuildClick,
  };

  const resetPasswordCandidateNavItems = buildHeaderNavItems({
    keys: getRoleHeaderNavKeys(user?.role ?? "JOB_SEEKER"),
    pathname: location.pathname,
    actions: candidateHeaderActions,
  });

  const resolvedNavItems = shouldUseAuthHeaderVariant
    ? resetPasswordCandidateNavItems
    : navItems;

  return (
    <Box className={styles.layoutRoot}>
      <PublicHeader
        canAccessProtectedRoutes={canAccessProtectedRoutes}
        navItems={resolvedNavItems}
        onProtectedNavClick={handleProtectedNavClick}
        onHelpClick={handleHelpClick}
        onSignUpClick={handleSignUpClick}
        onSearchClick={handleSearchClick}
        onNotificationClick={handleNotificationClick}
        showHelpButton={shouldUseLoginHeaderVariant}
        showNotificationButton={false}
        showProfileBadge={shouldUseAuthHeaderVariant}
        showSearchButton={
          shouldUseAuthHeaderVariant || !shouldUseLoginHeaderVariant
        }
        showSignUp={
          !shouldUseLoginHeaderVariant &&
          !isLoginPage &&
          !isSignupPage &&
          !isHiringLandingMode &&
          !shouldUseAuthHeaderVariant
        }
      />

      <OpportunitySearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
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
          visitorId={visitorId}
        />
      )}
    </Box>
  );
};
