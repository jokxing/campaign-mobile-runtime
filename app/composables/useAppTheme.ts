export type AppTheme = 'light' | 'dark';

export function useAppTheme() {
  const themeCookie = useCookie<AppTheme>('mobile-experience-theme', {
    default: () => 'light',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365
  });
  const theme = useState<AppTheme>('mobile-experience-theme', () => (themeCookie.value === 'dark' ? 'dark' : 'light'));

  watch(theme, value => {
    themeCookie.value = value;
  });

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  return { theme, toggleTheme };
}
