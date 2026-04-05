import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareGo",
  description: "良いコンディションの安定を、AIと一緒に作る",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      <body className="min-h-screen" style={{ fontFamily: 'var(--font-body, "DM Sans", system-ui, sans-serif)' }}>
        {children}
      </body>
    </html>
  );
}
