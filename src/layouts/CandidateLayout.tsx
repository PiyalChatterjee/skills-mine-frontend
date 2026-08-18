import { useEffect } from "react";
import { Box } from "@mui/material";
import type { MouseEvent } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "@/app/auth/AuthContext";
import { isJwtExpired } from "@/app/auth/jwt";
import {
  buildHeaderNavItems,
  getRoleHeaderNavKeys,
  type HeaderNavActionMap,
} from "@/layouts/headerNav";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { fetchCandidateProfileThunk } from "@/store/slices/candidateThunks";
import { PublicFooter } from "./components/PublicFooter";
import { PublicHeader } from "./components/PublicHeader";
import styles from "./CandidateLayout.module.css";

export const CandidateLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, tokens, user } = useAuth();

  useEffect(() => {
    // The session carries userId; candidateId is only known once a
    // candidate-scoped response has been read, so fall back to userId here.
    const resourceId = user?.candidateId ?? user?.userId;
    if (resourceId) {
      dispatch(fetchCandidateProfileThunk(resourceId, user?.userId));
    }
  }, [user?.candidateId, user?.userId, dispatch]);

  const accessToken = tokens?.accessToken;
  const hasValidAccessToken = accessToken ? !isJwtExpired(accessToken) : false;
  const canAccessProtectedRoutes = isAuthenticated && hasValidAccessToken;

  const handleHelpClick = () => {
    // TODO: Implement help action
  };

  const handleSignUpClick = () => {
    // TODO: Implement sign-up action
  };

  const handleSearchClick = () => {
    // TODO: Implement search action
  };

  const handleSavedJobPostsClick = () => {
    navigate(ROUTE_PATHS.savedJobs);
  };

  const handleCvBuilderClick = () => {
    navigate(ROUTE_PATHS.cvBuilder);
  };

  const handleSkillsBuildClick = () => {
    // TODO: Implement skills build navigation
    window.open("https://skillsbuild.org/", "_blank");
  };

  const handleBlogClick = () => {
    // TODO: Implement blog navigation
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

  const candidateHeaderActions: HeaderNavActionMap = {
    savedJobPosts: handleSavedJobPostsClick,
    cvBuilder: handleCvBuilderClick,
    skillsBuild: handleSkillsBuildClick,
    blog: handleBlogClick,
  };

  const candidateNavItems = buildHeaderNavItems({
    keys: getRoleHeaderNavKeys(user?.role ?? "JOB_SEEKER"),
    pathname: location.pathname,
    actions: candidateHeaderActions,
  });

  return (
    <Box className={styles.layoutRoot}>
      <PublicHeader
        canAccessProtectedRoutes={canAccessProtectedRoutes}
        navItems={candidateNavItems}
        onProtectedNavClick={handleProtectedNavClick}
        onHelpClick={handleHelpClick}
        onSignUpClick={handleSignUpClick}
        onSearchClick={handleSearchClick}
        showHelpButton={false}
        showSignUp={false}
        showNotificationButton={false}
        showProfileBadge={true}
        showSearchButton={true}
      />

      <Box component="main" className={styles.contentArea}>
        <Outlet />
      </Box>

      <PublicFooter showContactLink={true} />
    </Box>
  );
};
