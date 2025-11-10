import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thai Education Platform - แพลตฟอร์มการศึกษาไทย",
  description: "AI-Powered adaptive learning platform for Thai students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
