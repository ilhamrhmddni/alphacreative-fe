export function ThemeInitScript() {
  const themeScript = `
    (() => {
      function applyTheme() {
        const stored = localStorage.getItem('theme');
        const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      // Apply immediately
      applyTheme();
      
      // Apply on DOM ready as well
      if (document.readyState !== 'loading') {
        applyTheme();
      } else {
        document.addEventListener('DOMContentLoaded', applyTheme);
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
