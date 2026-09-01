import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { OpportunitySearchModal } from "@/modules/candidate/components/OpportunitySearchModal";
import { PublicFooter } from "./components/PublicFooter";
import { PublicHeader } from "./components/PublicHeader";
import styles from "./CandidateLayout.module.css";
import { useCandidateLayoutViewModel } from "./useCandidateLayoutViewModel";

export const CandidateLayout = () => {
  const {
    canAccessProtectedRoutes,
    candidateNavItems,
    handleCloseSearch,
    handleHelpClick,
    handleProtectedNavClick,
    handleSearchClick,
    handleSignUpClick,
    isSearchModalOpen,
  } = useCandidateLayoutViewModel();

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

      <OpportunitySearchModal
        open={isSearchModalOpen}
        onClose={handleCloseSearch}
      />

      <Box component="main" className={styles.contentArea}>
        <Outlet />
      </Box>

      <PublicFooter showContactLink={true} />
    </Box>
  );
};
