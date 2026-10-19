import type { Metadata, Viewport } from "next";
import "./globals.css";
import CustomCursor from "./components/CustomCursor";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "ScholarSync | Intelligent School & Study Hub",
  description: "The ultimate school productivity hub: interactive homework planner, Pomodoro focus lab, flashcards & quizzes, GPA target calculator, and STEM solver toolkit.",
  keywords: ["school helper", "study planner", "homework tracker", "GPA calculator", "flashcards", "pomodoro focus"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script
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
      </head>
      <body className="min-h-full overflow-x-hidden bg-[var(--bg)] text-[var(--text)] selection:bg-indigo-500 selection:text-white transition-colors duration-300">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
