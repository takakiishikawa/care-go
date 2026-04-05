import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const dmSans = DM_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareGo",
  description: "良いコンディションの安定を、AIと一緒に作る",
};

const themeInitScript = `(function(){try{var s=localStorage.getItem('carego-theme');if(s){document.documentElement.setAttribute('data-theme',s);}else{var h=(new Date().getUTCHours()+7)%24;document.documentElement.setAttribute('data-theme',(h>=18||h<6)?'dark':'light');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={dmSans.variable} suppressHydrationWarning>
      <body style={{ fontFamily: 'var(--font-body, "DM Sans", system-ui, sans-serif)' }}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
