import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useEffect, useState, type MouseEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import notificationBell from "@/assets/icons/notification-bell.svg";
import searchIcon from "@/assets/landing-page/search-icon.svg";
import skillsMineLogo from "@/assets/skillsMine-logo.svg";
import userIconWhite from "@/assets/public-layout/user-icon-white.svg";
import { useAuth } from "@/app/auth/AuthContext";
import { isJwtExpired } from "@/app/auth/jwt";
import type { HeaderNavItem } from "@/layouts/headerNav";
import { roleToDefaultRoute } from "@/routes/roleDefaultRoutes";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { authApi } from "@/services/api/authApi";
import styles from "../PublicLayout.module.css";

type PublicHeaderProps = {
  showHelpButton?: boolean;
  showSignUp?: boolean;
  showProfileBadge?: boolean;
  showSearchButton?: boolean;
  showNotificationButton?: boolean;
  canAccessProtectedRoutes: boolean;
  navItems?: HeaderNavItem[];
  onProtectedNavClick: (
    event: MouseEvent<HTMLAnchorElement>,
    targetPath: string,
  ) => void;
  onHelpClick: () => void;
  onNotificationClick?: () => void;
  onSignUpClick: () => void;
  onSearchClick: () => void;
};

export const PublicHeader = ({
  showHelpButton = false,
  showSignUp = false,
  showProfileBadge = false,
  showSearchButton = false,
  showNotificationButton = false,
  canAccessProtectedRoutes,
  navItems,
  onProtectedNavClick,
  onHelpClick,
  onNotificationClick,
  onSignUpClick,
  onSearchClick,
}: PublicHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, tokens, logout } = useAuth();
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const accessToken = tokens?.accessToken;
  const hasValidAccessToken = accessToken ? !isJwtExpired(accessToken) : false;
  const logoTarget =
    user && hasValidAccessToken
      ? roleToDefaultRoute[user.role]
      : ROUTE_PATHS.landing;
  const logoAriaLabel =
    user && hasValidAccessToken ? "Go to your dashboard" : "Go to landing page";

  const handleProfileBadgeClick = (event: MouseEvent<HTMLButtonElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleProfileSettingsClick = () => {
    handleProfileMenuClose();
    navigate(ROUTE_PATHS.profile);
  };

  const handleSignOutClick = async () => {
    handleProfileMenuClose();

    try {
      await authApi.logout();
    } catch {
      // Ignore API failures and still clear local session.
    } finally {
      logout();
      navigate(ROUTE_PATHS.login, { replace: true });
    }
  };

  const renderedNavItems = navItems ?? [];

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Box component="header" className={styles.topBar}>
      <Box className={styles.topBarInner}>
        <Box
          component={NavLink}
          to={logoTarget}
          aria-label={logoAriaLabel}
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
          <>
            <Box className={styles.navGroup}>
              <Box className={styles.desktopNavItems}>
                {renderedNavItems.map((item) => {
                  const itemClassName = item.isActive
                    ? styles.navItemSelected
                    : styles.navItemDefault;

                  if (item.to) {
                    const targetPath = item.to;

                    return (
                      <Box
                        key={item.id}
                        component={NavLink}
                        to={targetPath}
                        aria-disabled={
                          item.requiresAuth && !canAccessProtectedRoutes
                        }
                        onClick={(event) => {
                          if (item.requiresAuth) {
                            onProtectedNavClick(event, targetPath);
                            if (event.defaultPrevented) {
                              return;
                            }
                          }
                          item.onClick?.();
                        }}
                        className={itemClassName}
                      >
                        {item.label}
                      </Box>
                    );
                  }

                  return (
                    <Box
                      key={item.id}
                      component="button"
                      type="button"
                      onClick={item.onClick}
                      className={`${styles.navButton} ${itemClassName}`}
                    >
                      {item.label}
                    </Box>
                  );
                })}
              </Box>
              <IconButton
                aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileNavOpen ? "true" : undefined}
                aria-controls="mobile-nav-menu"
                onClick={() => setIsMobileNavOpen((prev) => !prev)}
                className={styles.mobileMenuButton}
              >
                <Box className={styles.mobileMenuIcon} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </Box>
              </IconButton>
            {showSignUp ? (
              <Button
                variant="contained"
                onClick={onSignUpClick}
                className={styles.signUpButton}
              >
                Sign up
              </Button>
            ) : null}
            {showNotificationButton ? (
              <IconButton
                aria-label="Notifications"
                onClick={onNotificationClick}
                className={styles.notificationButton}
              >
                <Box
                  className={styles.notificationBadgeDot}
                  aria-hidden="true"
                />
                <Box
                  component="img"
                  src={notificationBell}
                  aria-hidden="true"
                  alt=""
                />
              </IconButton>
            ) : null}
            {showProfileBadge ? (
              <>
                <Box
                  component="button"
                  type="button"
                  onClick={handleProfileBadgeClick}
                  aria-label="Open profile menu"
                  aria-controls={isProfileMenuOpen ? "profile-menu" : undefined}
                  aria-expanded={isProfileMenuOpen ? "true" : undefined}
                  aria-haspopup="menu"
                  className={styles.profileBadgeButton}
                >
                  <Box
                    component="span"
                    aria-hidden="true"
                    className={styles.profileBadge}
                  >
                    <Box
                      component="img"
                      src={userIconWhite}
                      alt=""
                      className={styles.profileIcon}
                    />
                  </Box>
                </Box>

                <Menu
                  id="profile-menu"
                  anchorEl={profileAnchorEl}
                  open={isProfileMenuOpen}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{
                    paper: {
                      className: styles.profileMenuPaper,
                    },
                    list: {
                      className: styles.profileMenuList,
                    },
                  }}
                >
                  <Box
                    className={styles.profileMenuUserBlock}
                  >
                    <Box
                      className={styles.profileMenuUserAvatar}
                      aria-hidden="true"
                    >
                      <Box
                        component="img"
                        src={userIconWhite}
                        alt=""
                        className={styles.profileMenuUserAvatarIcon}
                      />
                    </Box>
                    <Box className={styles.profileMenuUserText}>
                      <Typography className={styles.profileMenuUserName}>
                        {user?.displayName ?? "SkillsMine User"}
                      </Typography>
                      <Typography className={styles.profileMenuUserEmail}>
                        {user?.email ?? ""}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    className={styles.profileMenuDivider}
                    aria-hidden="true"
                  />

                  <MenuItem
                    onClick={handleProfileSettingsClick}
                    className={styles.profileMenuItem}
                  >
                    Profile settings
                  </MenuItem>
                  <MenuItem
                    onClick={handleSignOutClick}
                    className={styles.profileMenuItem}
                  >
                    Sign out
                  </MenuItem>
                </Menu>
              </>
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
            <Box
              id="mobile-nav-menu"
              className={`${styles.mobileNavPanel} ${
                isMobileNavOpen ? styles.mobileNavPanelOpen : ""
              }`}
            >
              {renderedNavItems.map((item) => {
                const itemClassName = item.isActive
                  ? styles.navItemSelected
                  : styles.navItemDefault;

                if (item.to) {
                  const targetPath = item.to;

                  return (
                    <Box
                      key={`mobile-${item.id}`}
                      component={NavLink}
                      to={targetPath}
                      aria-disabled={item.requiresAuth && !canAccessProtectedRoutes}
                      onClick={(event) => {
                        if (item.requiresAuth) {
                          onProtectedNavClick(event, targetPath);
                          if (event.defaultPrevented) {
                            return;
                          }
                        }
                        item.onClick?.();
                        setIsMobileNavOpen(false);
                      }}
                      className={`${itemClassName} ${styles.mobileNavItem}`}
                    >
                      {item.label}
                    </Box>
                  );
                }

                return (
                  <Box
                    key={`mobile-${item.id}`}
                    component="button"
                    type="button"
                    onClick={() => {
                      item.onClick?.();
                      setIsMobileNavOpen(false);
                    }}
                    className={`${styles.navButton} ${itemClassName} ${styles.mobileNavItem}`}
                  >
                    {item.label}
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};
