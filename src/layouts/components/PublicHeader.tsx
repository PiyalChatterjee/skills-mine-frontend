import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState, type MouseEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import searchIcon from "@/assets/landing-page/search-icon.svg";
import skillsMineLogo from "@/assets/skillsMine-logo.svg";
import userIcon from "@/assets/public-layout/user-icon.svg";
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
  onProtectedNavClick: (event: MouseEvent<HTMLAnchorElement>, targetPath: string) => void;
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
  const { user, tokens, logout } = useAuth();
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(
    null,
  );

  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const accessToken = tokens?.accessToken;
  const hasValidAccessToken = accessToken ? !isJwtExpired(accessToken) : false;
  const logoTarget = user && hasValidAccessToken
    ? roleToDefaultRoute[user.role]
    : ROUTE_PATHS.landing;
  const logoAriaLabel = user && hasValidAccessToken
    ? "Go to your dashboard"
    : "Go to landing page";

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
          <Box className={styles.navGroup}>
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
                    aria-disabled={item.requiresAuth && !canAccessProtectedRoutes}
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
                <Box className={styles.notificationBadgeDot} aria-hidden="true" />
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                  <path
                    d="M13 4.75C10.3766 4.75 8.25 6.87665 8.25 9.5V11.8C8.25 12.5515 7.98966 13.2798 7.51338 13.8612L6.51256 15.0822C5.67818 16.1004 6.40231 17.625 7.71872 17.625H18.2813C19.5977 17.625 20.3218 16.1004 19.4874 15.0822L18.4866 13.8612C18.0103 13.2798 17.75 12.5515 17.75 11.8V9.5C17.75 6.87665 15.6234 4.75 13 4.75Z"
                    fill="#c8c8c8"
                  />
                  <path
                    d="M10.75 20C11.1223 20.8731 11.9899 21.5 13 21.5C14.0101 21.5 14.8777 20.8731 15.25 20"
                    stroke="#c8c8c8"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
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
                      src={userIcon}
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
                  <Box className={styles.profileMenuUserBlock}>
                    <Box className={styles.profileMenuUserAvatar} aria-hidden="true">
                      <Box
                        component="img"
                        src={userIcon}
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

                  <Box className={styles.profileMenuDivider} aria-hidden="true" />

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
        )}
      </Box>
    </Box>
  );
};
