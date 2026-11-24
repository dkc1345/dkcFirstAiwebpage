
import type { Metadata, Viewport } from "next";
import "./globals.css";
import CustomCursor from "./components/CustomCursor";
import ThemeLoader from "./components/ThemeLoader";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "ScholarSync | Intelligent School & Study Hub",
  description:
    "The ultimate school productivity hub: interactive homework planner, Pomodoro focus lab, flashcards & quizzes, GPA target calculator, and STEM solver toolkit.",
  keywords: [
    "school helper",
    "study planner",
    "homework tracker",
    "GPA calculator",
    "flashcards",
    "pomodoro focus",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head />
      <body className="min-h-full overflow-x-hidden bg-[var(--bg)] text-[var(--text)] selection:bg-indigo-500 selection:text-white transition-colors duration-300">
        <ThemeLoader />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
