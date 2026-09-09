const LOGOUT_NAVIGATION_KEY = 'skillsmine.auth.logout-navigation'

export const beginLogoutNavigation = (): void => {
  sessionStorage.setItem(LOGOUT_NAVIGATION_KEY, 'pending')
}

export const isLogoutNavigationPending = (): boolean =>
  sessionStorage.getItem(LOGOUT_NAVIGATION_KEY) === 'pending'

export const completeLogoutNavigation = (): void => {
  sessionStorage.removeItem(LOGOUT_NAVIGATION_KEY)
}