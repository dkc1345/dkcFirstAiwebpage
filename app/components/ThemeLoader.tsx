// ThemeLoader component loads the theme from localStorage before hydration
"use client";

import Script from "next/script";

export default function ThemeLoader() {
  return (
    <Script
      id="theme-loader"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var saved = localStorage.getItem('scholarsync_theme') || 'dark';
              var resolved = saved;
              if (saved === 'system') {
                resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              document.documentElement.setAttribute('data-theme', resolved);
              document.documentElement.setAttribute('data-theme-setting', saved);
            } catch(e) {}
          })();
        `,
      }}
    />
  );
}
