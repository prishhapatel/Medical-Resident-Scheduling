import type { Metadata } from "next";
import "./globals.css";
import "./clean-print.css";
import { ThemeProvider } from "src/components/ui/theme-provider";
import { Toaster } from "../components/ui/toaster"
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Psycall",
  description: "Scheduler app for HCA Florida Residents",
  icons: {
    icon: [
      { url: '/HCAHeader.png', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' }
    ],
    shortcut: '/HCAHeader.png',
    apple: '/HCAHeader.png',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Clear any existing theme preferences to force system preference
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('theme');
                  localStorage.removeItem('next-themes');
                }
              `,
            }}
          />
        </head>
        <body>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="theme"
              forcedTheme={undefined}
            >
              {children}
            </ThemeProvider>
          </AuthProvider>
          <Toaster />
        </body>
      </html>
    </>
  );
}
