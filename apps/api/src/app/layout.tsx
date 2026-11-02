import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Split API",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
