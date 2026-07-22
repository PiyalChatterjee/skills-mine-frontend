import { Button } from "@mui/material";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import skillsMineLogo from "@/assets/skillsMine-logo.svg";
import { ROUTE_PATHS } from "@/routes/routePaths";
import styles from "./PublicLayout.module.css";

const searchIconUrl = "https://www.figma.com/api/mcp/asset/b6b13bc7-abae-40ae-a5d3-5bcb49234739";
const userIconUrl = "https://www.figma.com/api/mcp/asset/3832ad04-5b69-44b0-840f-44831f8f2d5e";

export const PublicLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === ROUTE_PATHS.login;

  return (
    <div className={styles.layoutRoot}>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <img
            src={skillsMineLogo}
            alt="SkillsMine"
            className={styles.logoPrimary}
          />

          {isLoginPage ? (
            <Button variant="text" className={styles.helpButton}>
              Need help?
            </Button>
          ) : (
            <div className={styles.navGroup}>
              <NavLink to={ROUTE_PATHS.jobs} className={styles.navItemMuted}>
                Explore Jobs
              </NavLink>
              <NavLink to={ROUTE_PATHS.dashboard} className={styles.navItemMuted}>
                Dashboard
              </NavLink>
              <NavLink to={ROUTE_PATHS.landing} className={styles.navItemActive}>
                Skills Build
              </NavLink>
              <NavLink to={ROUTE_PATHS.login} className={styles.navItemStrong}>
                Sign in
              </NavLink>
              <Button variant="contained" className={styles.signUpButton}>
                Sign up
              </Button>
              <span className={styles.profileBadge} aria-hidden="true">
                <img src={userIconUrl} alt="" className={styles.profileIcon} />
              </span>
              <button type="button" className={styles.searchButton} aria-label="Search site">
                <img src={searchIconUrl} alt="" className={styles.searchButtonIcon} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className={styles.contentArea}>
        <Outlet />
      </main>

      <footer className={styles.footerBar}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrandBlock}>
            <img
              src={skillsMineLogo}
              alt="SkillsMine"
              className={styles.logoFooter}
            />
            <p className={styles.copyrightText}>© 2026</p>
          </div>
          <div className={styles.footerLinks}>
            <p className={styles.footerLinkText}>Privacy</p>
            <p className={styles.footerLinkText}>Terms and Conditions</p>
            {!isLoginPage ? (
              <p className={styles.footerLinkText}>Contact</p>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
};
