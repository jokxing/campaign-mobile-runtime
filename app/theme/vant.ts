import type { ConfigProviderThemeVars } from 'vant';

// Map Vant to the application tokens. Light/dark values live only in theme.css.
export const vantThemeVars: ConfigProviderThemeVars = {
  primaryColor: 'var(--app-primary)',
  successColor: 'var(--app-success)',
  warningColor: 'var(--app-warning)',
  dangerColor: 'var(--app-danger)',
  textColor: 'var(--app-text)',
  textColor2: 'var(--app-text-secondary)',
  textColor3: 'var(--app-text-muted)',
  borderColor: 'var(--app-border)',
  background: 'var(--app-page)',
  background2: 'var(--app-surface)',
  activeColor: 'var(--app-active)',
  navBarBackground: 'var(--app-surface)',
  navBarTitleTextColor: 'var(--app-text)',
  tabbarBackground: 'var(--app-surface)',
  tabbarItemActiveColor: 'var(--app-primary)',
  tabbarItemTextColor: 'var(--app-nav-inactive)',
  tabTextColor: 'var(--app-text-secondary)',
  tabActiveTextColor: 'var(--app-text)',
  tabsBottomBarColor: 'var(--app-primary)',
  cellTextColor: 'var(--app-text)',
  cellLabelColor: 'var(--app-text-secondary)',
  progressBackground: 'var(--app-progress-track)'
};
