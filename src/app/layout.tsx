import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={dmSans.variable}>
      <body style={{ fontFamily: 'var(--font-body, "DM Sans", system-ui, sans-serif)' }}>
        {children}
      </body>
    </html>
  );
}
