const themeScript = `
(() => {
  const storageKey = 'theme';
  const root = document.documentElement;
  const savedTheme = window.localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : prefersDark
      ? 'dark'
      : 'light';

  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
