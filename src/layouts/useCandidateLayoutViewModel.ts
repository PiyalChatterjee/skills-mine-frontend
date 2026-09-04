import { useEffect, useState, type MouseEvent } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
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

export const useCandidateLayoutViewModel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, tokens, user } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== "JOB_SEEKER") return;

    const resourceId = user?.candidateId ?? user?.userId;
    if (!resourceId) return;

    const subscription = dispatch(
      fetchCandidateProfileThunk(resourceId, user?.userId),
    );
    return () => subscription.unsubscribe();
  }, [user?.candidateId, user?.role, user?.userId, dispatch]);

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
    setIsSearchModalOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchModalOpen(false);
  };

  const handleSavedJobPostsClick = () => {
    navigate(ROUTE_PATHS.savedJobs);
  };

  const handleCvBuilderClick = () => {
    navigate(ROUTE_PATHS.cvBuilder);
  };

  const handleSkillsBuildClick = () => {
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

  return {
    canAccessProtectedRoutes,
    candidateNavItems,
    handleCloseSearch,
    handleHelpClick,
    handleProtectedNavClick,
    handleSearchClick,
    handleSignUpClick,
    isSearchModalOpen,
  };
};