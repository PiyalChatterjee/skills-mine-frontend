import { Box } from "@mui/material";
import { useEffect, useState, type MouseEvent } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { isJwtExpired } from "@/app/auth/jwt";
import {
  PUBLIC_HEADER_NAV_PRESETS,
  buildHeaderNavItems,
  getRoleHeaderNavKeys,
  type HeaderNavActionMap,
} from "@/layouts/headerNav";
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
  const { isAuthenticated, tokens, user } = useAuth();
  const isLoginPage = location.pathname === ROUTE_PATHS.login;
  const isSignupPage = location.pathname === ROUTE_PATHS.signup;
  const isResetPasswordPage = location.pathname === ROUTE_PATHS.resetPassword;
  const landingMode = useSelector((state: RootState) => state.ui.landingMode);
  const isLandingPage = location.pathname === ROUTE_PATHS.landing;
  const isHiringLandingMode = isLandingPage && landingMode === "startHiring";
  const accessToken = tokens?.accessToken;
  const hasValidAccessToken = accessToken ? !isJwtExpired(accessToken) : false;
  const canAccessProtectedRoutes = isAuthenticated && hasValidAccessToken;
  const shouldUseAuthHeaderVariant = isResetPasswordPage && canAccessProtectedRoutes;
  const shouldUseLoginHeaderVariant = isLoginPage || (isResetPasswordPage && !canAccessProtectedRoutes);

  useEffect(() => {
    setSignUpDrawerOpen(false);
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
    // TODO: Implement action
  };

  const handleJobApplicationsClick = () => {
    // TODO: Implement job applications navigation
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

  const handleBlogClick = () => {
    // TODO: Implement blog navigation
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
    jobApplications: handleJobApplicationsClick,
    savedJobPosts: handleSavedJobPostsClick,
    cvBuilder: handleCvBuilderClick,
    skillsBuild: handleSkillsBuildClick,
    blog: handleBlogClick,
  };

  const resetPasswordCandidateNavItems = buildHeaderNavItems({
    keys: getRoleHeaderNavKeys(user?.role ?? "JOB_SEEKER"),
    pathname: location.pathname,
    actions: candidateHeaderActions,
  });

  const resolvedNavItems =
    shouldUseAuthHeaderVariant
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
        showNotificationButton={shouldUseAuthHeaderVariant}
        showProfileBadge={
          shouldUseAuthHeaderVariant ||
          (!isLoginPage &&
            !isSignupPage &&
            !isLandingPage &&
            !isHiringLandingMode &&
            !isResetPasswordPage)
        }
        showSearchButton={
          shouldUseAuthHeaderVariant ||
          (!isLoginPage &&
            !isSignupPage &&
            !isLandingPage &&
            !isHiringLandingMode &&
            !isResetPasswordPage)
        }
        showSignUp={
          !shouldUseLoginHeaderVariant &&
          !isLoginPage &&
          !isSignupPage &&
          !shouldUseAuthHeaderVariant
        }
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
